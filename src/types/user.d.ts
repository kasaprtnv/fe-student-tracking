import { IPagination, StoreAction } from '@/types/index';

export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  profileImageUrl?: string;
  code: string;
  titleId?: string;
  firstName: string;
  lastName: string;
  email?: string;
  role: UserRole;
  phone?: string;
  degree?: string;
  major?: string;
  year?: string;
  studyPlan?: string;
  teacherDegree?: string;
  academicPosition?: string;
  courseId?: string;
  courseName?: string;
  enrollDate?: string;
  graduated?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserState {
  // Data
  userMap: Record<string, User>;
  paginatedUserMap: Record<string, User>;
  paginatedStudentMap: Record<string, User>;
  paginatedTeacherMap: Record<string, User>;

  // UI States
  searchQuery: string;
  storeAction: StoreAction;
  loader: boolean;
  error: string | null;

  // Pagination (per-tab)
  pagination: IPagination;
  studentPagination: IPagination;
  teacherPagination: IPagination;
}
