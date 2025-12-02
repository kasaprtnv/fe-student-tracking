import { z } from 'zod';

export const createUserSchema = (t: (key: string) => string) =>
  z
    .object({
      code: z.string().min(1, t('code-required')),
      firstName: z
        .string()
        .min(1, t('first-name-required'))
        .min(2, t('first-name-min'))
        .max(50, t('first-name-max')),
      lastName: z
        .string()
        .min(1, t('last-name-required'))
        .min(2, t('last-name-min'))
        .max(50, t('last-name-max')),
      email: z.string().email(t('email-invalid')),
      phone: z.string().max(20, t('phone-max')).optional().or(z.literal('')),
      degree: z.string().max(100, t('degree-max')).optional().or(z.literal('')),
      year: z.string().max(10, t('year-max')).optional().or(z.literal('')),
      role: z.enum(['student', 'teacher', 'admin']),
      courseId: z.string().optional().or(z.literal('')),
    })
    .refine(
      (data) => {
        if (data.role === 'student' || data.role === 'teacher') {
          return data.courseId && data.courseId.trim() !== '';
        }
        return true;
      },
      {
        message: t('course-required-for-student'),
        path: ['courseId'],
      },
    );

export const updateUserSchema = (t: (key: string) => string) =>
  z
    .object({
      code: z.string().min(1, t('code-required')),
      firstName: z
        .string()
        .min(1, t('first-name-required'))
        .min(2, t('first-name-min'))
        .max(50, t('first-name-max')),
      lastName: z
        .string()
        .min(1, t('last-name-required'))
        .min(2, t('last-name-min'))
        .max(50, t('last-name-max')),
      email: z.string().email(t('email-invalid')).optional().or(z.literal('')),
      phone: z.string().max(20, t('phone-max')).optional().or(z.literal('')),
      degree: z.string().max(100, t('degree-max')).optional().or(z.literal('')),
      year: z.string().max(10, t('year-max')).optional().or(z.literal('')),
      role: z.enum(['student', 'teacher', 'admin']),
      courseId: z.string().optional().or(z.literal('')),
    })
    .refine(
      (data) => {
        if (data.role === 'student' || data.role === 'teacher') {
          return data.courseId && data.courseId.trim() !== '';
        }
        return true;
      },
      {
        message: t('course-required-for-student'),
        path: ['courseId'],
      },
    );

export type CreateUserFormData = z.infer<ReturnType<typeof createUserSchema>>;
export type UpdateUserFormData = z.infer<ReturnType<typeof updateUserSchema>>;
