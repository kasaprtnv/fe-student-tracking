export type UserRole = 'admin' | 'teacher' | 'student';
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone: string;
  degree: string;
  code: string;
  year: string;
  courseId: string;
  enrollDate: string;
}
