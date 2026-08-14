import { Router } from 'express';
import { authenticate, authorize, communityScope } from '../middleware';
import * as ctrl from '../controllers/community';

const router = Router();

router.get('/', ctrl.getAllCommunities);
router.get('/:id', ctrl.getCommunity);

router.use(authenticate);

router.get('/:id/members', communityScope('id'), ctrl.getCommunityMembers);
router.post('/', authorize('super_admin'), ctrl.createCommunity);
router.put('/:id', authorize('super_admin', 'community_admin'), communityScope('id'), ctrl.updateCommunity);
router.delete('/:id', authorize('super_admin'), ctrl.deleteCommunity);
router.post('/:id/join', ctrl.joinCommunity);
router.post('/:id/leave', ctrl.leaveCommunity);

export default router;
