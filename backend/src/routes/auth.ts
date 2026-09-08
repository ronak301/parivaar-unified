import { Router } from 'express';
import {
  sendOtp,
  verifyOtp,
  adminLogin,
  me,
  checkPhone,
  sendActionOtp,
  verifyActionOtp,
  generateAdminOtp,
} from '../controllers/auth';
import { authenticate, authorize, asyncHandler } from '../middleware';
import { rateLimit } from '../middleware/rateLimit';

const router = Router();

router.post('/check-phone', asyncHandler(checkPhone));
router.post('/send-otp', asyncHandler(sendOtp));
router.post('/verify-otp', asyncHandler(verifyOtp));
router.post('/admin-login', asyncHandler(adminLogin));
router.get('/me', authenticate, asyncHandler(me));
router.post('/admin-generate-otp', authenticate, authorize('super_admin', 'community_admin'), asyncHandler(generateAdminOtp));

// Re-verification for sensitive member actions (requires a live session).
router.post(
  '/action-otp/send',
  authenticate,
  rateLimit({ windowMs: 10 * 60 * 1000, max: 5, keyPrefix: 'action-otp-send' }),
  asyncHandler(sendActionOtp),
);
router.post(
  '/action-otp/verify',
  authenticate,
  rateLimit({ windowMs: 10 * 60 * 1000, max: 10, keyPrefix: 'action-otp-verify' }),
  asyncHandler(verifyActionOtp),
);

export default router;
