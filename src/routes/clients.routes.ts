/**
 * Clients Routes
 */

import { Router } from 'express';
import { makeInvoker } from 'awilix-express';
import { ClientsController } from '../controllers/clients';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { createClientSchema, updateClientSchema } from '../dtos/clients.dto';

const router = Router();
const api = makeInvoker(ClientsController);

router.use(authMiddleware);

router.get('/', api('index'));
router.get('/:id', api('show'));
router.post('/', validate(createClientSchema), api('create'));
router.put('/:id', validate(updateClientSchema), api('update'));
router.delete('/:id', api('delete'));

export default router;

