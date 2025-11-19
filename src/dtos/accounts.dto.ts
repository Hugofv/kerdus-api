/**
 * Account DTOs
 */

import { z } from 'zod';
import { Currency, AccountStatus } from '../constants/enums';

export const createAccountSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email(),
  document: z.string().optional(),
  status: z.nativeEnum(AccountStatus).default(AccountStatus.ACTIVE),
  currency: z.nativeEnum(Currency).default(Currency.BRL),
  plan: z.string().optional(),
  meta: z.record(z.unknown()).optional(),
  ownerId: z.number().int().optional(),
});

export const updateAccountSchema = createAccountSchema.partial();

export type CreateAccountDto = z.infer<typeof createAccountSchema>;
export type UpdateAccountDto = z.infer<typeof updateAccountSchema>;

