import { Router } from 'express';
import { sendOtp, verifyOtp, adminLogin } from '../controllers/auth';
import { asyncHandler } from '../middleware';

const router = Router();

router.post('/send-otp', asyncHandler(sendOtp));
router.post('/verify-otp', asyncHandler(verifyOtp));
router.post('/admin-login', asyncHandler(adminLogin));

export default router;
