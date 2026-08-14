import type { Response } from 'express';
import mongoose from 'mongoose';
import type { AuthRequest } from '../middleware';
import { User, Family } from '../models';

export async function createFamily(req: AuthRequest, res: Response): Promise<void> {
  const { headId, sampradaya, communityIds } = req.body;

  if (!headId) {
    res.status(400).json({ error: 'headId is required' });
    return;
  }

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

  const members = await User.find({ familyId: family._id })
    .select('enrollmentId firstName lastName fullName profilePicture dob gender phone fatherId motherId spouseId childrenIds isFamilyHead isAlive demiseDate');

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
  const { newHeadId } = req.body;
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

export async function addFamilyMember(req: AuthRequest, res: Response): Promise<void> {
  const family = await Family.findById(req.params.id);
  if (!family) {
    res.status(404).json({ error: 'Family not found' });
    return;
  }

  const { userId, relation, relativeId } = req.body;
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
      case 'child':
        user.childrenIds.push(relative._id);
        relative.fatherId = user._id;
        break;
    }
    await relative.save();
  }

  const mergedIds = [...new Set([...user.communityIds.map(String), ...family.communityIds.map(String)])];
  user.communityIds = mergedIds.map((id) => new mongoose.Types.ObjectId(id)) as typeof user.communityIds;

  await user.save();

  res.json({ success: true, user });
}
