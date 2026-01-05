import { z } from 'zod';

export const createMilestoneSchema = (t: (key: string) => string) =>
  z
    .object({
      name: z.string().nonempty(t('errors.name-required')),
      description: z.string().optional(),

      notifyBeforeDays: z
        .number()
        .int(t('errors.notifyBeforeDays-integer'))
        .min(0, t('errors.notifyBeforeDays-min')),

      dayPeriod: z
        .number()
        .int(t('errors.dayPeriod-integer'))
        .min(0, t('errors.dayPeriod-min')),
    })
    .superRefine((data, ctx) => {
      if (data.notifyBeforeDays > data.dayPeriod) {
        ctx.addIssue({
          path: ['notifyBeforeDays'],
          code: z.ZodIssueCode.custom,
          message: t('errors.notifyBeforeDays-greater-than-dayPeriod'),
        });
      }
    });

export const updateMilestoneSchema = (t: (key: string) => string) =>
  z
    .object({
      name: z.string().nonempty(t('errors.name-required')),
      description: z.string().optional(),

      notifyBeforeDays: z
        .number()
        .int(t('errors.notifyBeforeDays-integer'))
        .min(0, t('errors.notifyBeforeDays-min')),

      dayPeriod: z
        .number()
        .int(t('errors.dayPeriod-integer'))
        .min(0, t('errors.dayPeriod-min')),

      isActive: z.boolean().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.notifyBeforeDays > data.dayPeriod) {
        ctx.addIssue({
          path: ['notifyBeforeDays'],
          code: z.ZodIssueCode.custom,
          message: t('errors.notifyBeforeDays-greater-than-dayPeriod'),
        });
      }
    });

export type CreateMilestoneFormData = z.infer<
  ReturnType<typeof createMilestoneSchema>
>;

export type UpdateMilestoneFormData = z.infer<
  ReturnType<typeof updateMilestoneSchema>
>;
