/**
 * Operations Routes
 */

import { Router } from 'express';
import { makeInvoker } from 'awilix-express';
import { OperationsController } from '../controllers/operations';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { createOperationSchema, updateOperationSchema, registerPaymentSchema } from '../dtos/operations.dto';

const router = Router();
const api = makeInvoker(OperationsController);

router.use(authMiddleware);

router.get('/', api('index'));
router.get('/:id', api('show'));
router.post('/', validate(createOperationSchema), api('create'));
router.put('/:id', validate(updateOperationSchema), api('update'));
router.delete('/:id', api('delete'));
router.post('/:id/register-payment', validate(registerPaymentSchema), api('registerPayment'));
router.post('/:id/trigger-alert', api('triggerAlert'));

export default router;

