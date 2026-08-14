import { Router } from 'express';
import { authenticate, authorize } from '../middleware';
import * as ctrl from '../controllers/family';

const router = Router();

router.use(authenticate);

router.get('/:id', ctrl.getFamily);
router.get('/:id/tree', ctrl.getFamilyTree);
router.post('/', authorize('super_admin', 'community_admin'), ctrl.createFamily);
router.put('/:id', authorize('super_admin', 'community_admin'), ctrl.updateFamily);
router.post('/:id/change-head', authorize('super_admin', 'community_admin'), ctrl.changeFamilyHead);
router.post('/:id/add-member', authorize('super_admin', 'community_admin'), ctrl.addFamilyMember);

export default router;
