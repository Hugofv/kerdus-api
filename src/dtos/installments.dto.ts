/**
 * Installment DTOs
 */

import { z } from 'zod';
import { InstallmentStatus } from '../constants/enums';

export const updateInstallmentSchema = z.object({
  dueDate: z.string().datetime().optional().or(z.date().optional()),
  amount: z.number().positive().optional().or(z.string().transform((val) => parseFloat(val)).optional()),
  notes: z.string().optional(),
  status: z.nativeEnum(InstallmentStatus).optional(),
});

export type UpdateInstallmentDto = z.infer<typeof updateInstallmentSchema>;

