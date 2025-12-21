import { StoreAction } from '@/types/index';

export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  supabaseId?: string;
  code: string;
  title?: string;
  firstName: string;
  lastName: string;
  email?: string;
  role: UserRole;
  phone?: string;
  degree?: string;
  major?: string;
  year?: string;
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

  // UI States
  searchQuery: string;
  storeAction: StoreAction;
  loader: boolean;
  error: string | null;
}
