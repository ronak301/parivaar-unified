import { Router } from 'express';
import { authenticate, authorize, asyncHandler } from '../middleware';
import * as ctrl from '../controllers/locality';

const router = Router();

router.use(authenticate);

router.get('/suggest', authorize('super_admin', 'community_admin'), asyncHandler(ctrl.suggestLocalities));

export default router;
