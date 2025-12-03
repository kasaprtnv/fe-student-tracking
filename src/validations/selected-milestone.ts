import { z } from 'zod';

export const selectedMilestoneSchema = (t: (key: string) => string) =>
  z.object({
    selectedItems: z.string().array().min(1, t('errors.no-milestone-selected')),
  });

export type SelectedMilestoneFormData = z.infer<
  ReturnType<typeof selectedMilestoneSchema>
>;

export const unlockConditionSchema = (t: (key: string) => string) =>
  z.object({
    targetId: z.string().nonempty(t('errors.targetId-required')),
    conditions: z
      .array(
        z.object({
          type: z.enum(['milestone', 'step']),
          id: z.string(),
        }),
      )
      .min(1, t('errors.condition-required')),
  });

export type UnlockConditionFormData = z.infer<
  ReturnType<typeof unlockConditionSchema>
>;
