import { Router } from 'express';
import { authenticate, authorize, asyncHandler } from '../middleware';
import * as ctrl from '../controllers/family';

const router = Router();

router.use(authenticate);

router.post('/', authorize('super_admin', 'community_admin'), asyncHandler(ctrl.createFamily));
router.post('/batch-create', authorize('super_admin', 'community_admin'), asyncHandler(ctrl.batchCreateFamily));
router.get('/:id', asyncHandler(ctrl.getFamily));
router.get('/:id/tree', asyncHandler(ctrl.getFamilyTree));
router.put('/:id', authorize('super_admin', 'community_admin'), asyncHandler(ctrl.updateFamily));
router.post('/:id/change-head', authorize('super_admin', 'community_admin'), asyncHandler(ctrl.changeFamilyHead));
router.post('/:id/add-member', authorize('super_admin', 'community_admin'), asyncHandler(ctrl.addFamilyMember));

export default router;
