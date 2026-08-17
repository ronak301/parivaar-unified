import { Router } from 'express';
import { sendOtp, verifyOtp } from '../controllers/auth';
import { asyncHandler } from '../middleware';

const router = Router();

router.post('/send-otp', asyncHandler(sendOtp));
router.post('/verify-otp', asyncHandler(verifyOtp));

export default router;
