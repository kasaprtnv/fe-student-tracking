import { z } from 'zod';

export const studentSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  firstname: z
    .string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters')
    .regex(/^[a-zA-Zก-๙\s]+$/, 'First name can only contain letters'),
  lastname: z
    .string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters')
    .regex(/^[a-zA-Zก-๙\s]+$/, 'Last name can only contain letters'),
  degree: z
    .string()
    .max(100, 'Degree must not exceed 100 characters')
    .optional()
    .or(z.literal('')),
});

// For creating student (no ID field)
export const createStudentSchema = studentSchema;

// For updating student (with ID field)
export const updateStudentSchema = studentSchema;

export type StudentFormData = z.infer<typeof studentSchema>;
export type CreateStudentFormData = z.infer<typeof createStudentSchema>;
export type UpdateStudentFormData = z.infer<typeof updateStudentSchema>;
