import { Router } from 'express';
import { authenticate, authorize, communityScope, asyncHandler } from '../middleware';
import * as ctrl from '../controllers/user';

const router = Router();

router.use(authenticate);

router.get('/search', asyncHandler(ctrl.searchUsers));
router.get('/check-phone', asyncHandler(ctrl.checkPhone));
router.get('/orphans', authorize('super_admin'), asyncHandler(ctrl.getOrphanMembers));
router.get('/community/:communityId', communityScope(), asyncHandler(ctrl.getUsersByCommunity));
router.get('/events/:communityId', communityScope(), asyncHandler(ctrl.getUserEvents));
router.get('/:id', asyncHandler(ctrl.getUser));
router.post('/', authorize('super_admin', 'community_admin'), asyncHandler(ctrl.createUser));
router.put('/:id/block', authorize('super_admin', 'community_admin'), asyncHandler(ctrl.blockUser));
router.put('/:id/unblock', authorize('super_admin', 'community_admin'), asyncHandler(ctrl.unblockUser));
router.put('/:id/mark-death', authorize('super_admin', 'community_admin'), asyncHandler(ctrl.markDeath));
router.put('/:id', asyncHandler(ctrl.updateUser));
router.delete('/:id', authorize('super_admin', 'community_admin'), asyncHandler(ctrl.deleteUser));

export default router;
