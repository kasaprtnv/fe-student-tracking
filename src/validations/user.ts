import { z } from 'zod';

export type UserRole = 'student' | 'teacher';

// Base schema for common fields
const baseSchema = (t: (key: string) => string) =>
  z.object({
    role: z.enum(['student', 'teacher']),
    titleId: z.string().optional(),
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
    studyPlan: z.string().min(1, t('errors.study-plan-required')),
    courseId: z.string().min(1, t('errors.course-required')),
    enrollDate: z.string().min(1, t('errors.enroll-date-required')),
  });

// Teacher-specific schema
const teacherSchema = (t: (key: string) => string) =>
  baseSchema(t).extend({
    role: z.literal('teacher'),
    teacherDegree: z.string().optional(),
    courseIds: z.array(z.string()).optional(),
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
  titleId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  courseId?: string;
  courseIds?: string[];
  code?: string;
  degree?: string;
  year?: string;
  studyPlan?: string;
  teacherDegree?: string;
  enrollDate?: string;
}
