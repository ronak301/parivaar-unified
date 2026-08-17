import mongoose from 'mongoose';
import { User, Family, MatrimonialProfile, BusinessEnquiry, BusinessPromotion } from '../models';
import type { IApprovalRequest } from '../models';

export async function applyApprovalEffect(approval: IApprovalRequest): Promise<void> {
  const { entityType, entityId, payload, status } = approval;

  if (status === 'approved') {
    await applyApproveEffect(entityType, entityId, payload);
  } else if (status === 'rejected') {
    await applyRejectEffect(entityType, entityId);
  }
}

async function applyApproveEffect(
  entityType: string,
  entityId?: string,
  payload?: Record<string, unknown>,
): Promise<void> {
  switch (entityType) {
    case 'profile_edit': {
      if (!entityId || !payload) return;
      await User.findByIdAndUpdate(entityId, payload, { runValidators: true });
      break;
    }

    case 'new_member': {
      if (!payload) return;
      const user = await User.create(payload);
      if (payload.familyId) {
        user.familyId = new mongoose.Types.ObjectId(payload.familyId as string);
        const family = await Family.findById(payload.familyId);
        if (family) {
          const mergedIds = [
            ...new Set([
              ...user.communityIds.map(String),
              ...family.communityIds.map(String),
            ]),
          ];
          user.communityIds = mergedIds.map(
            (id) => new mongoose.Types.ObjectId(id),
          ) as typeof user.communityIds;
        }
        await user.save();
      }
      break;
    }

    case 'death_marking': {
      if (!entityId) return;
      const user = await User.findById(entityId);
      if (!user) return;

      user.isAlive = false;
      if (payload?.demiseDate) {
        user.demiseDate = new Date(payload.demiseDate as string);
      }
      await user.save();

      if (user.isFamilyHead && user.familyId) {
        const newHeadId = payload?.newHeadId as string | undefined;
        if (newHeadId) {
          const newHead = await User.findOne({ _id: newHeadId, familyId: user.familyId });
          if (newHead) {
            user.isFamilyHead = false;
            await user.save();
            newHead.isFamilyHead = true;
            await newHead.save();
            await Family.updateOne({ _id: user.familyId }, { headId: newHead._id });
          }
        }
      }
      break;
    }

    case 'family_head_change': {
      if (!entityId || !payload?.newHeadId) return;
      const family = await Family.findById(entityId);
      if (!family) return;

      await User.updateOne({ _id: family.headId }, { isFamilyHead: false });
      family.headId = new mongoose.Types.ObjectId(payload.newHeadId as string);
      await family.save();
      await User.updateOne({ _id: payload.newHeadId }, { isFamilyHead: true });
      break;
    }

    case 'matrimonial': {
      if (!entityId) return;
      await MatrimonialProfile.findByIdAndUpdate(entityId, { status: 'approved' });
      break;
    }

    case 'business_enquiry': {
      if (!entityId) return;
      await BusinessEnquiry.findByIdAndUpdate(entityId, { status: 'approved' });
      break;
    }

    case 'business_promotion': {
      if (!entityId) return;
      await BusinessPromotion.findByIdAndUpdate(entityId, { status: 'approved' });
      break;
    }
  }
}

async function applyRejectEffect(entityType: string, entityId?: string): Promise<void> {
  if (!entityId) return;

  switch (entityType) {
    case 'matrimonial':
      await MatrimonialProfile.findByIdAndUpdate(entityId, { status: 'rejected' });
      break;
    case 'business_enquiry':
      await BusinessEnquiry.findByIdAndUpdate(entityId, { status: 'rejected' });
      break;
    case 'business_promotion':
      await BusinessPromotion.findByIdAndUpdate(entityId, { status: 'rejected' });
      break;
  }
}
