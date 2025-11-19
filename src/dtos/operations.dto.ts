/**
 * Operation DTOs
 */

import { z } from 'zod';
import { OperationType, Frequency, Currency } from '../constants/enums';

export const createOperationSchema = z.object({
  accountId: z.number().int().positive(),
  clientId: z.number().int().positive(),
  type: z.nativeEnum(OperationType),
  title: z.string().optional(),
  description: z.string().optional(),
  principalAmount: z.number().positive().or(z.string().transform((val) => parseFloat(val))),
  currency: z.nativeEnum(Currency).default(Currency.BRL),
  startDate: z.string().datetime().or(z.date()),
  dueDate: z.string().datetime().optional().or(z.date().optional()),
  frequency: z.nativeEnum(Frequency).optional(),
  interestRate: z.number().nonnegative().optional().or(z.string().transform((val) => parseFloat(val)).optional()),
  entryAmount: z.number().nonnegative().optional().or(z.string().transform((val) => parseFloat(val)).optional()),
  installments: z.number().int().positive().optional(),
  depositAmount: z.number().nonnegative().optional().or(z.string().transform((val) => parseFloat(val)).optional()),
  collateralMeta: z.record(z.unknown()).optional(),
  meta: z.record(z.unknown()).optional(),
  status: z.string().optional(),
  resourceId: z.number().int().positive().optional(),
});

export const updateOperationSchema = createOperationSchema.partial().omit({ accountId: true, clientId: true });

export const registerPaymentSchema = z.object({
  amount: z.number().positive().or(z.string().transform((val) => parseFloat(val))),
  method: z.string().optional(),
  installmentId: z.string().optional().or(z.number().int().positive().optional()),
  reference: z.string().optional(),
  meta: z.record(z.unknown()).optional(),
});

export type CreateOperationDto = z.infer<typeof createOperationSchema>;
export type UpdateOperationDto = z.infer<typeof updateOperationSchema>;
export type RegisterPaymentDto = z.infer<typeof registerPaymentSchema>;

