import { Router } from 'express';
import { authenticate, authorize, communityScope, asyncHandler } from '../middleware';
import * as ctrl from '../controllers/feed';

const router = Router();

router.use(authenticate);

router.get('/community/:communityId', communityScope(), asyncHandler(ctrl.getFeed));
router.get('/me/submissions', asyncHandler(ctrl.getMySubmissions));
router.delete('/:id', authorize('super_admin', 'community_admin'), asyncHandler(ctrl.removeFeedItem));

export default router;
