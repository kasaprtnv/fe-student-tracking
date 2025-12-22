import { z } from 'zod';

export const createMilestoneSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().nonempty(t('errors.name-required')),
    description: z.string().optional(),
    notifyBeforeDays: z
      .int(t('errors.notifyBeforeDays-integer'))
      .min(0, t('errors.notifyBeforeDays-min')),
    dayPeriod: z
      .int(t('errors.dayPeriod-integer'))
      .min(0, t('errors.dayPeriod-min')),
  });

export const updateMilestoneSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().nonempty(t('errors.name-required')),
    description: z.string().optional(),
    notifyBeforeDays: z
      .int(t('errors.notifyBeforeDays-integer'))
      .min(0, t('errors.notifyBeforeDays-min')),
    dayPeriod: z
      .int(t('errors.dayPeriod-integer'))
      .min(0, t('errors.dayPeriod-min')),
    isActive: z.boolean().optional(),
  });

export type CreateMilestoneFormData = z.infer<
  ReturnType<typeof createMilestoneSchema>
>;

export type UpdateMilestoneFormData = z.infer<
  ReturnType<typeof updateMilestoneSchema>
>;
