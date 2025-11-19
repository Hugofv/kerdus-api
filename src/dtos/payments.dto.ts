/**
 * Payment DTOs
 */

import { z } from 'zod';
import { PaymentMethod, Currency } from '../constants/enums';

export const createPaymentSchema = z.object({
  clientId: z.number().int().positive(),
  operationId: z.string().or(z.number().int().positive()),
  installmentId: z.string().optional().or(z.number().int().positive().optional()),
  amount: z.number().positive().or(z.string().transform((val) => parseFloat(val))),
  currency: z.nativeEnum(Currency).default(Currency.BRL),
  paidAt: z.string().datetime().optional().or(z.date().optional()),
  method: z.nativeEnum(PaymentMethod).optional(),
  reference: z.string().optional(),
  meta: z.record(z.unknown()).optional(),
});

export type CreatePaymentDto = z.infer<typeof createPaymentSchema>;

