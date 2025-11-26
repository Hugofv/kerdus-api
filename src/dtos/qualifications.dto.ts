/**
 * Lead Qualification DTOs
 */

import { z } from 'zod';

export const createQualificationSchema = z.object({
  accountId: z.number().int().positive().optional(),
  clientId: z.number().int().positive().optional(),
  questionKey: z.string().min(1),
  question: z.string().min(1),
  answer: z.union([z.string(), z.number(), z.array(z.unknown()), z.record(z.unknown())]).optional(),
  score: z.number().int().min(0).max(100).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const updateQualificationSchema = createQualificationSchema.partial();

export const saveQualificationAnswersSchema = z.object({
  accountId: z.number().int().positive().optional(),
  clientId: z.number().int().positive().optional(),
  answers: z.array(z.object({
    questionKey: z.string(),
    answer: z.union([z.string(), z.number(), z.array(z.unknown()), z.record(z.unknown())]),
    score: z.number().int().min(0).max(100).optional(),
  })),
});

export type CreateQualificationDto = z.infer<typeof createQualificationSchema>;
export type UpdateQualificationDto = z.infer<typeof updateQualificationSchema>;
export type SaveQualificationAnswersDto = z.infer<typeof saveQualificationAnswersSchema>;

