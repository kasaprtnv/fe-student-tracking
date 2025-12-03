import { z } from 'zod';

export const createMilestoneStepSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().nonempty(t('errors.name-required')),
    description: z.string().optional(),
    requiresAttachment: z.boolean(),
    dayPeriod: z.number().int().optional(),
    notifyBeforeDays: z.number().int().optional(),
  });
export const updateMilestoneStepSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().nonempty(t('errors.name-required')),
    description: z.string().optional(),
    requiresAttachment: z.boolean(),
    dayPeriod: z.number().int().optional(),
    notifyBeforeDays: z.number().int().optional(),
    isActive: z.boolean().optional(),
  });

export type CreateMilestoneStepFormData = z.infer<
  ReturnType<typeof createMilestoneStepSchema>
>;

export type UpdateMilestoneStepFormData = z.infer<
  ReturnType<typeof updateMilestoneStepSchema>
>;
