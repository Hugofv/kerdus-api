/**
 * Client DTOs
 */

import { z } from 'zod';

export const createClientSchema = z.object({
  accountId: z.number().int().positive(),
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  meta: z.record(z.unknown()).optional(),
});

export const updateClientSchema = createClientSchema.partial().omit({ accountId: true });

export type CreateClientDto = z.infer<typeof createClientSchema>;
export type UpdateClientDto = z.infer<typeof updateClientSchema>;

