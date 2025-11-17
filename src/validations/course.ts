import { z } from 'zod';

export const createCourseSchema = (t: (key: string) => string) =>
  z.object({
    code: z.string().nonempty(t('errors.code-required')),
    name: z.string().nonempty(t('errors.name-required')),
    description: z.string().optional(),
  });

export const updateCourseSchema = (t: (key: string) => string) =>
  z.object({
    code: z.string().nonempty(t('errors.code-required')),
    name: z.string().nonempty(t('errors.name-required')),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
  });

export type CreateCourseFormData = z.infer<
  ReturnType<typeof createCourseSchema>
>;

export type UpdateCourseFormData = z.infer<
  ReturnType<typeof updateCourseSchema>
>;
