import { Router } from 'express';
import { authenticate, authorize, communityScope, asyncHandler } from '../middleware';
import * as ctrl from '../controllers/business';

const router = Router();

router.use(authenticate);

router.get('/owner/:userId', asyncHandler(ctrl.getBusinessByOwner));
router.get('/community/:communityId', communityScope(), asyncHandler(ctrl.getBusinessesByCommunity));
router.get('/enquiries/community/:communityId', communityScope(), asyncHandler(ctrl.getEnquiries));
router.get('/promotions/community/:communityId', communityScope(), asyncHandler(ctrl.getPromotions));
router.get('/:id', asyncHandler(ctrl.getBusiness));
router.post('/', asyncHandler(ctrl.createBusiness));
router.put('/:id', asyncHandler(ctrl.updateBusiness));
router.delete('/:id', authorize('super_admin', 'community_admin'), asyncHandler(ctrl.deleteBusiness));
router.post('/enquiry', asyncHandler(ctrl.createEnquiry));
router.post('/promotion', asyncHandler(ctrl.createPromotion));

export default router;
