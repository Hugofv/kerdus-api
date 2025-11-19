/**
 * Accounts Routes
 */

import { Router } from 'express';
import { makeInvoker } from 'awilix-express';
import { AccountsController } from '../controllers/accounts';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { createAccountSchema, updateAccountSchema } from '../dtos/accounts.dto';

const router = Router();
const api = makeInvoker(AccountsController);

router.use(authMiddleware);

router.get('/', api('index'));
router.get('/:id', api('show'));
router.post('/', validate(createAccountSchema), api('create'));
router.put('/:id', validate(updateAccountSchema), api('update'));
router.delete('/:id', api('delete'));

export default router;

