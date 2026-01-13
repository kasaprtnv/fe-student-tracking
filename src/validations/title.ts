import { z } from 'zod';

export const createTitleSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().nonempty(t('errors.name-required')),
    description: z.string().optional(),
  });

export const updateTitleSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().nonempty(t('errors.name-required')),
    description: z.string().optional(),
  });

export type CreateTitleFormData = z.infer<ReturnType<typeof createTitleSchema>>;

export type UpdateTitleFormData = z.infer<ReturnType<typeof updateTitleSchema>>;
