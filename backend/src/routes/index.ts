import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './user';
import familyRoutes from './family';
import communityRoutes from './community';
import localityRoutes from './locality';
import businessRoutes from './business';
import approvalRoutes from './approval';
import notificationRoutes from './notification';
import matrimonialRoutes from './matrimonial';
import feedRoutes from './feed';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/families', familyRoutes);
router.use('/communities', communityRoutes);
router.use('/localities', localityRoutes);
router.use('/businesses', businessRoutes);
router.use('/approvals', approvalRoutes);
router.use('/notifications', notificationRoutes);
router.use('/matrimonial', matrimonialRoutes);
router.use('/feed', feedRoutes);

export default router;
