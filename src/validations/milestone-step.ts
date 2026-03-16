import { z } from 'zod';

export const createMilestoneStepSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().nonempty(t('errors.name-required')),
    description: z.string().optional(),
    requiresAttachment: z.boolean(),
    dayPeriod: z.number().int(),
    notifyBeforeDays: z.number().int(),
    secondNotifyBeforeDays: z.number().int(),
  });
export const updateMilestoneStepSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().nonempty(t('errors.name-required')),
    description: z.string().optional(),
    requiresAttachment: z.boolean(),
    dayPeriod: z.number().int(),
    notifyBeforeDays: z.number().int(),
    secondNotifyBeforeDays: z.number().int(),
    isActive: z.boolean().optional(),
  });

export type CreateMilestoneStepFormData = z.infer<
  ReturnType<typeof createMilestoneStepSchema>
>;

export type UpdateMilestoneStepFormData = z.infer<
  ReturnType<typeof updateMilestoneStepSchema>
>;
