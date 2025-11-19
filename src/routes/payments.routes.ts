/**
 * Payments Routes
 */

import { Router } from 'express';
import { makeInvoker } from 'awilix-express';
import { PaymentsController } from '../controllers/payments';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { createPaymentSchema } from '../dtos/payments.dto';

const router = Router();
const api = makeInvoker(PaymentsController);

router.use(authMiddleware);

router.get('/', api('index'));
router.get('/:id', api('show'));
router.post('/', validate(createPaymentSchema), api('create'));

export default router;

