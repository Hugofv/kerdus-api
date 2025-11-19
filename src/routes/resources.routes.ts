/**
 * Resources Routes
 */

import { Router } from 'express';
import { makeInvoker } from 'awilix-express';
import { ResourcesController } from '../controllers/resources';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const api = makeInvoker(ResourcesController);

router.use(authMiddleware);

router.get('/', api('index'));
router.get('/:id', api('show'));
router.post('/', api('create'));
router.put('/:id', api('update'));
router.delete('/:id', api('delete'));

export default router;

