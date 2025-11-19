import { z } from 'zod';

export const createMilestoneSchema = (t: (key: string) => string) =>
  z.object({
    courseId: z.string().nonempty(t('errors.courseId-required')),
    name: z.string().nonempty(t('errors.name-required')),
    description: z.string().optional(),
    position: z
      .int(t('errors.position-integer')) // ต้องเป็นจำนวนเต็ม
      .nonnegative(t('errors.position-nonnegative')), // ต้องไม่เป็นค่าลบ,
    notifyReceiverEmail: z
      .string()
      .nonempty(t('errors.notifyReceiverEmail-required')),
    deadlineDate: z.date({
      error: (issue) =>
        issue.input === undefined
          ? t('errors.deadlineDate-required')
          : t('errors.deadlineDate-invalid'),
    }),
    notifyBeforeDays: z
      .int(t('errors.notifyBeforeDays-integer'))
      .min(0, t('errors.notifyBeforeDays-min')),
  });

export const updateMilestoneSchema = (t: (key: string) => string) =>
  z.object({
    courseId: z.string().nonempty(t('errors.courseId-required')),
    name: z.string().nonempty(t('errors.name-required')),
    description: z.string().optional(),
    position: z
      .int(t('errors.position-integer')) // ต้องเป็นจำนวนเต็ม
      .nonnegative(t('errors.position-nonnegative')), // ต้องไม่เป็นค่าลบ,
    notifyReceiverEmail: z
      .string()
      .nonempty(t('errors.notifyReceiverEmail-required')),
    deadlineDate: z.date({
      error: (issue) =>
        issue.input === undefined
          ? t('errors.deadlineDate-required')
          : t('errors.deadlineDate-invalid'),
    }),
    notifyBeforeDays: z
      .int(t('errors.notifyBeforeDays-integer'))
      .min(0, t('errors.notifyBeforeDays-min')),
    isActive: z.boolean().optional(),
  });

export type CreateMilestoneFormData = z.infer<
  ReturnType<typeof createMilestoneSchema>
>;

export type UpdateMilestoneFormData = z.infer<
  ReturnType<typeof updateMilestoneSchema>
>;
