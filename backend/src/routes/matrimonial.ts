import { Router } from 'express';
import { authenticate, authorize, communityScope, asyncHandler } from '../middleware';
import * as ctrl from '../controllers/matrimonial';

const router = Router();

router.use(authenticate);

router.get('/community/:communityId', communityScope(), asyncHandler(ctrl.getMatrimonialProfiles));
router.get('/:id', asyncHandler(ctrl.getMatrimonialProfile));
router.post('/', asyncHandler(ctrl.createMatrimonialProfile));
router.delete('/:id', authorize('super_admin', 'community_admin'), asyncHandler(ctrl.deleteMatrimonialProfile));

export default router;
