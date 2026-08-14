import { Router } from 'express';
import { authenticate, authorize, communityScope } from '../middleware';
import * as ctrl from '../controllers/approval';

const router = Router();

router.use(authenticate);

router.get(
  '/community/:communityId',
  authorize('super_admin', 'community_admin'),
  communityScope(),
  ctrl.getApprovalRequests,
);
router.post('/', communityScope(), ctrl.createApprovalRequest);
router.put('/:id/review', authorize('super_admin', 'community_admin'), ctrl.reviewApproval);

export default router;
