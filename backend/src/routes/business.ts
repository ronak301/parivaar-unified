import { Router } from 'express';
import { authenticate, authorize, communityScope, recordScope, bodyCommunityScope, asyncHandler } from '../middleware';
import { Business } from '../models';
import * as ctrl from '../controllers/business';

const router = Router();

router.use(authenticate);

router.get('/owner/:userId', asyncHandler(ctrl.getBusinessByOwner));
router.get('/community/:communityId', communityScope(), asyncHandler(ctrl.getBusinessesByCommunity));
router.get('/categories/community/:communityId', communityScope(), asyncHandler(ctrl.getBusinessCategoryCounts));
router.get('/enquiries/community/:communityId', communityScope(), asyncHandler(ctrl.getEnquiries));
router.get('/promotions/community/:communityId', communityScope(), asyncHandler(ctrl.getPromotions));
router.get('/:id', recordScope(Business), asyncHandler(ctrl.getBusiness));
router.post('/', bodyCommunityScope(), asyncHandler(ctrl.createBusiness));
router.put('/:id', recordScope(Business), bodyCommunityScope(), asyncHandler(ctrl.updateBusiness));
router.delete('/:id', authorize('super_admin', 'community_admin'), recordScope(Business), asyncHandler(ctrl.deleteBusiness));
router.post('/submit', asyncHandler(ctrl.submitBusiness));
router.post('/enquiry', communityScope(), asyncHandler(ctrl.createEnquiry));
router.post('/promotion', communityScope(), asyncHandler(ctrl.createPromotion));

export default router;
