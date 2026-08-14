import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './user';
import familyRoutes from './family';
import communityRoutes from './community';
import businessRoutes from './business';
import approvalRoutes from './approval';
import notificationRoutes from './notification';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/families', familyRoutes);
router.use('/communities', communityRoutes);
router.use('/businesses', businessRoutes);
router.use('/approvals', approvalRoutes);
router.use('/notifications', notificationRoutes);

export default router;
