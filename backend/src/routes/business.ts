import { Router } from 'express';
import { authenticate, authorize, communityScope } from '../middleware';
import * as ctrl from '../controllers/business';

const router = Router();

router.use(authenticate);

router.get('/community/:communityId', communityScope(), ctrl.getBusinessesByCommunity);
router.get('/:id', ctrl.getBusiness);
router.post('/', ctrl.createBusiness);
router.put('/:id', ctrl.updateBusiness);
router.delete('/:id', authorize('super_admin', 'community_admin'), ctrl.deleteBusiness);
router.post('/enquiry', ctrl.createEnquiry);
router.post('/promotion', ctrl.createPromotion);

export default router;
