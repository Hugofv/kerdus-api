/**
 * Plans DTOs
 */

import { z } from 'zod';

export const createPlanSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  currency: z.string().default('BRL'),
  billingPeriod: z.enum(['MONTHLY', 'YEARLY']).default('MONTHLY'),
  isActive: z.boolean().default(true),
  isPublic: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  maxOperations: z.number().int().positive().nullable().optional(),
  maxClients: z.number().int().positive().nullable().optional(),
  maxUsers: z.number().int().positive().nullable().optional(),
  maxStorage: z.number().int().positive().nullable().optional(), // in MB
  featurePricing: z.record(z.number()).optional(), // { featureId: price }
  featureIds: z.array(z.number().int().positive()).optional(), // Features to enable
  meta: z.record(z.unknown()).optional(),
});

export const updatePlanSchema = createPlanSchema.partial();

export type CreatePlanDto = z.infer<typeof createPlanSchema>;
export type UpdatePlanDto = z.infer<typeof updatePlanSchema>;

