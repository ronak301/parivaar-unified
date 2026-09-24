import { Router } from 'express';
import { authenticate, authorize, communityScope, recordScope, asyncHandler } from '../middleware';
import { MatrimonialProfile } from '../models';
import * as ctrl from '../controllers/matrimonial';

const router = Router();

router.use(authenticate);

router.get('/community/:communityId', communityScope(), asyncHandler(ctrl.getMatrimonialProfiles));
router.get('/:id', recordScope(MatrimonialProfile), asyncHandler(ctrl.getMatrimonialProfile));
router.post('/', communityScope(), asyncHandler(ctrl.createMatrimonialProfile));
router.delete('/:id', authorize('super_admin', 'community_admin'), recordScope(MatrimonialProfile), asyncHandler(ctrl.deleteMatrimonialProfile));

export default router;
