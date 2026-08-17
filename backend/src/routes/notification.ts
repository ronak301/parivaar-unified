import { Router } from 'express';
import { authenticate, asyncHandler } from '../middleware';
import * as ctrl from '../controllers/notification';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(ctrl.getMyNotifications));
router.put('/:id/read', asyncHandler(ctrl.markAsRead));
router.put('/read-all', asyncHandler(ctrl.markAllAsRead));
router.post('/push-token', asyncHandler(ctrl.registerPushToken));
router.delete('/push-token', asyncHandler(ctrl.unregisterPushToken));

export default router;
