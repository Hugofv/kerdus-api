/**
 * Settings Routes
 */

import { Router } from 'express';
import { makeInvoker } from 'awilix-express';
import { SettingsController } from '../controllers/settings';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const api = makeInvoker(SettingsController);

router.use(authMiddleware);

router.get('/', api('index'));
router.get('/:key', api('show'));
router.post('/', api('create'));
router.put('/:key', api('update'));
router.patch('/:key', api('upsert'));
router.delete('/:key', api('delete'));

export default router;

