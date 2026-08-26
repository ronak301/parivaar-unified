import type { Response } from 'express';
import mongoose from 'mongoose';
import {
  createFamilySchema,
  addFamilyMemberSchema,
  addFamilyMembersSchema,
  changeFamilyHeadSchema,
  batchCreateFamilySchema,
} from '@parivaar/shared';
import type { AuthRequest } from '../middleware';
import { User, Family, Business } from '../models';
import type { IUser } from '../models';

export async function createFamily(req: AuthRequest, res: Response): Promise<void> {
  const parsed = createFamilySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    return;
  }

  const { headId, sampradaya, communityIds } = parsed.data;

  const head = await User.findById(headId);
  if (!head) {
    res.status(404).json({ error: 'Head user not found' });
    return;
  }

  const family = await Family.create({ headId, sampradaya, communityIds });

  head.familyId = family._id;
  head.isFamilyHead = true;
  await head.save();

  res.status(201).json({ success: true, family });
}

export async function getFamily(req: AuthRequest, res: Response): Promise<void> {
  const family = await Family.findById(req.params.id).populate('headId', 'firstName lastName fullName profilePicture');
  if (!family) {
    res.status(404).json({ error: 'Family not found' });
    return;
  }

  res.json({ success: true, family });
}

export async function getFamilyTree(req: AuthRequest, res: Response): Promise<void> {
  const family = await Family.findById(req.params.id);
  if (!family) {
    res.status(404).json({ error: 'Family not found' });
    return;
  }

  const members = await User.find({ familyId: family._id, isBlocked: { $ne: true } })
    .select('enrollmentId firstName lastName fullName profilePicture dob gender phone fatherId motherId spouseId childrenIds siblingIds isFamilyHead isAlive demiseDate');

  res.json({ success: true, family, members });
}

export async function updateFamily(req: AuthRequest, res: Response): Promise<void> {
  const { sampradaya, communityIds } = req.body;
  const family = await Family.findByIdAndUpdate(
    req.params.id,
    { sampradaya, communityIds },
    { new: true, runValidators: true },
  );

  if (!family) {
    res.status(404).json({ error: 'Family not found' });
    return;
  }

  res.json({ success: true, family });
}

export async function changeFamilyHead(req: AuthRequest, res: Response): Promise<void> {
  const parsed = changeFamilyHeadSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    return;
  }

  const { newHeadId } = parsed.data;
  const family = await Family.findById(req.params.id);

  if (!family) {
    res.status(404).json({ error: 'Family not found' });
    return;
  }

  const newHead = await User.findOne({ _id: newHeadId, familyId: family._id });
  if (!newHead) {
    res.status(400).json({ error: 'New head must be an existing family member' });
    return;
  }

  await User.updateOne({ _id: family.headId }, { isFamilyHead: false });

  family.headId = newHead._id;
  await family.save();

  newHead.isFamilyHead = true;
  await newHead.save();

  res.json({ success: true, family });
}

export async function batchCreateFamily(req: AuthRequest, res: Response): Promise<void> {
  const parsed = batchCreateFamilySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    return;
  }

  try {
    const { head: headData, communityIds, sampradaya, business: businessData, members: membersData } = parsed.data;

    const communityObjectIds = communityIds.map((id) => new mongoose.Types.ObjectId(id));

    const headUser = await User.create({ ...headData, communityIds: communityObjectIds });

    const family = await Family.create({
      headId: headUser._id,
      sampradaya,
      communityIds: communityObjectIds,
    });

    headUser.familyId = family._id;
    headUser.isFamilyHead = true;
    await headUser.save();

    if (businessData) {
      try {
        await Business.create({
          ...businessData,
          ownerId: headUser._id,
          communityId: communityIds[0],
        });
      } catch (err) {
        console.error('Business creation failed in batch:', err);
      }
    }

    const createdMembers: Array<{ _id: string; firstName: string; lastName?: string }> = [];

    if (membersData && membersData.length > 0) {
      const allUsers = [headUser];

      for (const memberData of membersData) {
        const { relation, relativeIndex, ...userData } = memberData;

        const memberUser = await User.create({
          ...userData,
          communityIds: communityObjectIds,
          familyId: family._id,
          address: headUser.address,
          nativePlace: headUser.nativePlace,
          nativeDistrict: headUser.nativeDistrict,
        });

        if (relation && relativeIndex !== undefined) {
          const relativeUser = relativeIndex === -1 ? headUser : allUsers[relativeIndex + 1];
          if (relativeUser) {
            switch (relation) {
              case 'father':
                memberUser.fatherId = relativeUser._id;
                relativeUser.childrenIds.push(memberUser._id);
                break;
              case 'mother':
                memberUser.motherId = relativeUser._id;
                relativeUser.childrenIds.push(memberUser._id);
                break;
              case 'spouse':
                memberUser.spouseId = relativeUser._id;
                relativeUser.spouseId = memberUser._id;
                break;
              case 'sibling':
                memberUser.siblingIds.push(relativeUser._id);
                relativeUser.siblingIds.push(memberUser._id);
                break;
              case 'child':
                memberUser.childrenIds.push(relativeUser._id);
                relativeUser.fatherId = memberUser._id;
                break;
              case 'son':
              case 'daughter':
                if (relativeUser.gender === 'female') {
                  memberUser.motherId = relativeUser._id;
                } else {
                  memberUser.fatherId = relativeUser._id;
                }
                relativeUser.childrenIds.push(memberUser._id);
                if (relation === 'son') memberUser.gender = 'male';
                else memberUser.gender = 'female';
                break;
            }
            await relativeUser.save();
            await memberUser.save();
          }
        }

        allUsers.push(memberUser);
        createdMembers.push({
          _id: memberUser._id.toString(),
          firstName: memberUser.firstName,
          lastName: memberUser.lastName,
        });
      }
    }

    res.status(201).json({
      success: true,
      family,
      head: { _id: headUser._id.toString(), firstName: headUser.firstName, lastName: headUser.lastName },
      members: createdMembers,
    });
  } catch (err) {
    console.error('batchCreateFamily error:', err);
    const message = err instanceof Error ? err.message : 'Failed to create family';
    res.status(500).json({ error: message });
  }
}

export async function addFamilyMember(req: AuthRequest, res: Response): Promise<void> {
  const parsed = addFamilyMemberSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    return;
  }

  const family = await Family.findById(req.params.id);
  if (!family) {
    res.status(404).json({ error: 'Family not found' });
    return;
  }

  const { userId, relation, relativeId } = parsed.data;
  const user = await User.findById(userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  user.familyId = family._id;

  if (relation && relativeId) {
    const relative = await User.findById(relativeId);
    if (!relative) {
      res.status(404).json({ error: 'Relative not found' });
      return;
    }

    switch (relation) {
      case 'father':
        user.fatherId = relative._id;
        relative.childrenIds.push(user._id);
        break;
      case 'mother':
        user.motherId = relative._id;
        relative.childrenIds.push(user._id);
        break;
      case 'spouse':
        user.spouseId = relative._id;
        relative.spouseId = user._id;
        break;
      case 'sibling':
        user.siblingIds.push(relative._id);
        relative.siblingIds.push(user._id);
        break;
      case 'child':
        user.childrenIds.push(relative._id);
        relative.fatherId = user._id;
        break;
      case 'son':
      case 'daughter':
        if (relative.gender === 'female') {
          user.motherId = relative._id;
        } else {
          user.fatherId = relative._id;
        }
        relative.childrenIds.push(user._id);
        user.gender = relation === 'son' ? 'male' : 'female';
        break;
    }
    await relative.save();
  }

  const mergedIds = [...new Set([...user.communityIds.map(String), ...family.communityIds.map(String)])];
  user.communityIds = mergedIds.map((id) => new mongoose.Types.ObjectId(id)) as typeof user.communityIds;

  await user.save();

  res.json({ success: true, user });
}

export async function addFamilyMembers(req: AuthRequest, res: Response): Promise<void> {
  const parsed = addFamilyMembersSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    return;
  }

  const family = await Family.findById(req.params.id);
  if (!family) {
    res.status(404).json({ error: 'Family not found' });
    return;
  }

  const headUser = await User.findById(family.headId);

  try {
    const createdInThisBatch: IUser[] = [];

    for (const memberData of parsed.data.members) {
      const { firstName, lastName, phone, relation, relativeId, relativeIndex } = memberData;

      const relative = relativeId
        ? await User.findById(relativeId)
        : createdInThisBatch[relativeIndex as number];

      if (!relative) {
        res.status(400).json({ error: 'Related-to member not found' });
        return;
      }

      let gender: string | undefined;
      if (relation === 'son') gender = 'male';
      else if (relation === 'daughter') gender = 'female';
      else if (relation === 'spouse') {
        gender = relative.gender === 'female' ? 'male' : relative.gender === 'male' ? 'female' : undefined;
      }

      const memberUser = await User.create({
        firstName,
        lastName,
        phone,
        gender,
        familyId: family._id,
        communityIds: family.communityIds,
        address: headUser?.address,
        nativePlace: headUser?.nativePlace,
        nativeDistrict: headUser?.nativeDistrict,
      });

      switch (relation) {
        case 'spouse':
          memberUser.spouseId = relative._id;
          relative.spouseId = memberUser._id;
          break;
        case 'sibling':
          memberUser.siblingIds.push(relative._id);
          relative.siblingIds.push(memberUser._id);
          break;
        case 'son':
        case 'daughter':
          if (relative.gender === 'female') {
            memberUser.motherId = relative._id;
          } else {
            memberUser.fatherId = relative._id;
          }
          relative.childrenIds.push(memberUser._id);
          break;
      }

      await relative.save();
      await memberUser.save();
      createdInThisBatch.push(memberUser);
    }

    res.status(201).json({
      success: true,
      members: createdInThisBatch.map((m) => ({
        _id: m._id.toString(),
        firstName: m.firstName,
        lastName: m.lastName,
        enrollmentId: m.enrollmentId,
      })),
    });
  } catch (err) {
    console.error('addFamilyMembers error:', err);
    const message = err instanceof Error ? err.message : 'Failed to add family members';
    res.status(500).json({ error: message });
  }
}
