import { Router } from 'express';
import { authenticate, authorize, communityScope } from '../middleware';
import * as ctrl from '../controllers/user';

const router = Router();

router.use(authenticate);

router.get('/search', ctrl.searchUsers);
router.get('/check-phone', ctrl.checkPhone);
router.get('/community/:communityId', communityScope(), ctrl.getUsersByCommunity);
router.get('/events/:communityId', communityScope(), ctrl.getUserEvents);
router.get('/:id', ctrl.getUser);
router.post('/', authorize('super_admin', 'community_admin'), ctrl.createUser);
router.put('/:id', ctrl.updateUser);
router.delete('/:id', authorize('super_admin', 'community_admin'), ctrl.deleteUser);

export default router;
