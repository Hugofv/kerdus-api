/**
 * Platform Users Routes
 */

import { Router } from 'express';
import { makeInvoker } from 'awilix-express';
import { PlatformUsersController } from '../controllers/platformUsers';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();
const api = makeInvoker(PlatformUsersController);

router.use(authMiddleware);

router.get('/', requireRole('owner', 'admin'), api('index'));
router.get('/:id', requireRole('owner', 'admin'), api('show'));
router.post('/', requireRole('owner', 'admin'), api('create'));
router.put('/:id', requireRole('owner', 'admin'), api('update'));
router.delete('/:id', requireRole('owner', 'admin'), api('delete'));

export default router;

