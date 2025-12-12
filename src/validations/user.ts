import { z } from 'zod';

export type UserRole = 'student' | 'teacher';

// Base schema for common fields
const baseSchema = (t: (key: string) => string) =>
  z.object({
    role: z.enum(['student', 'teacher']),
    firstName: z
      .string()
      .min(1, t('errors.first-name-required'))
      .min(2, t('errors.first-name-min'))
      .max(50, t('errors.first-name-max')),
    lastName: z
      .string()
      .min(1, t('errors.last-name-required'))
      .min(2, t('errors.last-name-min'))
      .max(50, t('errors.last-name-max')),
    email: z
      .string()
      .min(1, t('errors.email-required'))
      .email(t('errors.email-invalid')),
    phone: z
      .string()
      .min(1, t('errors.phone-required'))
      .max(20, t('errors.phone-max')),
  });

// Student-specific schema
const studentSchema = (t: (key: string) => string) =>
  baseSchema(t).extend({
    role: z.literal('student'),
    code: z.string().min(1, t('errors.code-required')),
    degree: z
      .string()
      .min(1, t('errors.degree-required'))
      .max(100, t('errors.degree-max')),
    year: z
      .string()
      .min(1, t('errors.year-required'))
      .max(10, t('errors.year-max')),
    courseId: z.string().min(1, t('errors.course-required')),
    enrollDate: z.string().optional(),
  });

// Teacher-specific schema
const teacherSchema = (t: (key: string) => string) =>
  baseSchema(t).extend({
    role: z.literal('teacher'),
    courseId: z.string().min(1, t('errors.course-required')),
  });

// Combined schema using discriminated union
export const createUserSchema = (t: (key: string) => string) =>
  z.discriminatedUnion('role', [studentSchema(t), teacherSchema(t)]);

export const updateUserSchema = (t: (key: string) => string) =>
  z.discriminatedUnion('role', [studentSchema(t), teacherSchema(t)]);

export type CreateUserFormData = z.infer<ReturnType<typeof createUserSchema>>;
export type UpdateUserFormData = z.infer<ReturnType<typeof updateUserSchema>>;

export interface UserFormValues {
  role: UserRole;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  courseId: string;
  code?: string;
  degree?: string;
  year?: string;
  enrollDate?: string;
}
