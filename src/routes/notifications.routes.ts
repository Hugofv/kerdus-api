/**
 * Notifications Routes
 */

import { Router } from 'express';
import { makeInvoker } from 'awilix-express';
import { NotificationsController } from '../controllers/notifications';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const api = makeInvoker(NotificationsController);

router.use(authMiddleware);

router.get('/', api('index'));
router.get('/:id', api('show'));
router.post('/', api('create'));
router.put('/:id', api('update'));
router.patch('/:id/read', api('markAsRead'));
router.delete('/:id', api('delete'));

export default router;

