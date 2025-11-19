/**
 * Installments Routes
 */

import { Router } from 'express';
import { makeInvoker } from 'awilix-express';
import { InstallmentsController } from '../controllers/installments';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { updateInstallmentSchema } from '../dtos/installments.dto';

const router = Router();
const api = makeInvoker(InstallmentsController);

router.use(authMiddleware);

router.get('/', api('index'));
router.get('/:id', api('show'));
router.patch('/:id', validate(updateInstallmentSchema), api('update'));
router.patch('/:id/mark-paid', api('markPaid'));

export default router;

