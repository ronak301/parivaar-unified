import { Router } from 'express';
import { authenticate, authorize, communityScope, asyncHandler } from '../middleware';
import * as ctrl from '../controllers/community';

const router = Router();

router.get('/', asyncHandler(ctrl.getAllCommunities));
router.get('/:id', asyncHandler(ctrl.getCommunity));

router.use(authenticate);

router.get('/:id/members', communityScope('id'), asyncHandler(ctrl.getCommunityMembers));
router.post('/', authorize('super_admin'), asyncHandler(ctrl.createCommunity));
router.put('/:id', authorize('super_admin', 'community_admin'), communityScope('id'), asyncHandler(ctrl.updateCommunity));
router.delete('/:id', authorize('super_admin'), asyncHandler(ctrl.deleteCommunity));
router.post('/:id/join', asyncHandler(ctrl.joinCommunity));
router.post('/:id/leave', asyncHandler(ctrl.leaveCommunity));

// Per-community admin login management (super-admin only).
router.get('/:id/admin', authorize('super_admin'), asyncHandler(ctrl.getCommunityAdminInfo));
router.post('/:id/admin', authorize('super_admin'), asyncHandler(ctrl.createCommunityAdmin));
router.post('/:id/admin/regenerate', authorize('super_admin'), asyncHandler(ctrl.regenerateCommunityAdminPassword));
router.delete('/:id/admin', authorize('super_admin'), asyncHandler(ctrl.deleteCommunityAdmin));

export default router;
