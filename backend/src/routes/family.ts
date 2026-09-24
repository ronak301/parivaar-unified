import { Router } from 'express';
import { authenticate, authorize, recordScope, bodyCommunityScope, asyncHandler } from '../middleware';
import { Family } from '../models';
import * as ctrl from '../controllers/family';

const router = Router();

router.use(authenticate);

router.post('/', authorize('super_admin', 'community_admin'), bodyCommunityScope(), asyncHandler(ctrl.createFamily));
router.post('/batch-create', authorize('super_admin', 'community_admin'), bodyCommunityScope(), asyncHandler(ctrl.batchCreateFamily));
router.get('/:id', recordScope(Family), asyncHandler(ctrl.getFamily));
router.get('/:id/tree', recordScope(Family), asyncHandler(ctrl.getFamilyTree));
router.put('/:id', authorize('super_admin', 'community_admin'), recordScope(Family), bodyCommunityScope(), asyncHandler(ctrl.updateFamily));
router.post('/:id/change-head', authorize('super_admin', 'community_admin'), recordScope(Family), asyncHandler(ctrl.changeFamilyHead));
router.post('/:id/add-member', authorize('super_admin', 'community_admin'), recordScope(Family), asyncHandler(ctrl.addFamilyMember));
router.post('/:id/add-members', authorize('super_admin', 'community_admin'), recordScope(Family), asyncHandler(ctrl.addFamilyMembers));

export default router;
