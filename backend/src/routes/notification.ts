import { Router } from 'express';
import { authenticate } from '../middleware';
import * as ctrl from '../controllers/notification';

const router = Router();

router.use(authenticate);

router.get('/', ctrl.getMyNotifications);
router.put('/:id/read', ctrl.markAsRead);
router.put('/read-all', ctrl.markAllAsRead);

export default router;
