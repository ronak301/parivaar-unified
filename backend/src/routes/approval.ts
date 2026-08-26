import { Router } from 'express';
import { authenticate, authorize, communityScope, asyncHandler } from '../middleware';
import { rateLimit } from '../middleware/rateLimit';
import * as ctrl from '../controllers/approval';

const router = Router();

router.post(
  '/public/submit-family',
  rateLimit({ windowMs: 60 * 60 * 1000, max: 10, keyPrefix: 'public-submit-family' }),
  asyncHandler(ctrl.submitPublicFamilyRequest),
);

router.use(authenticate);

router.get(
  '/community/:communityId',
  authorize('super_admin', 'community_admin'),
  communityScope(),
  asyncHandler(ctrl.getApprovalRequests),
);
router.post('/', communityScope(), asyncHandler(ctrl.createApprovalRequest));
router.put('/:id/review', authorize('super_admin', 'community_admin'), asyncHandler(ctrl.reviewApproval));

export default router;
