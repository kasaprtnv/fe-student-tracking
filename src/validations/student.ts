// validations/student.ts
import { z } from 'zod';

export const createStudentSchema = (t: (key: string) => string) =>
  z.object({
    code: z.string().min(1, t('student-id-required')),
    firstName: z
      .string()
      .min(1, t('first-name-required'))
      .min(2, t('first-name-min'))
      .max(50, t('first-name-max'))
      .regex(/^[a-zA-Zก-๙\s]+$/, t('first-name-invalid')),
    lastName: z
      .string()
      .min(1, t('last-name-required'))
      .min(2, t('last-name-min'))
      .max(50, t('last-name-max'))
      .regex(/^[a-zA-Zก-๙\s]+$/, t('last-name-invalid')),
    degree: z.string().max(100, t('degree-max')).optional().or(z.literal('')),
  });

export const updateStudentSchema = createStudentSchema;

export type CreateStudentFormData = z.infer<
  ReturnType<typeof createStudentSchema>
>;

export type UpdateStudentFormData = z.infer<
  ReturnType<typeof updateStudentSchema>
>;
