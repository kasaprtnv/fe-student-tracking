import { IPagination, StoreAction } from '@/types/index';

export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  profileImageUrl?: string;
  code: string;
  titleId?: string;
  titleName?: string;
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
  managedCourses?: { id: string; name: string }[];
  enrollDate?: string;
  graduated?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;

  fullNameWithTitle?: string;
  courseCodeWithName?: string;
}

export interface StudentFilterPayload {
  code?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  major?: string;
  degree?: string[];
  year?: string[];
  courseId?: string[];
  studyPlan?: string[];
  enrollDateFrom?: string;
  enrollDateTo?: string;
  graduated?: string[];
  search?: string;
  managedCourseIds?: string[];
}

export interface UserState {
  // Data
  userMap: Record<string, User>;
  paginatedUserMap: Record<string, User>;
  paginatedStudentMap: Record<string, User>;
  paginatedTeacherMap: Record<string, User>;
  filteredStudentMap: Record<string, User>;

  // UI States
  searchQuery: string;
  storeAction: StoreAction;
  loader: boolean;
  filteredStudentLoader: boolean;
  error: string | null;

  // Pagination (per-tab)
  pagination: IPagination;
  studentPagination: IPagination;
  teacherPagination: IPagination;
  filteredStudentPagination: IPagination;
}
