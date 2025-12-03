import { User } from './user';
export interface ICourse {
  id: string;
  code: string;
  name: string;
  degree: string;
  description?: string;
  isUsed: boolean;
  createdAt: Date;
  updatedAt: Date;

  staffIds?: string[];
  users?: User[];
}

export interface ICourseCreateDTO {
  code: string;
  name: string;
  degree: string;
  description?: string;
  staffIds?: string[];
}

export interface CourseState {
  // Data
  courseMap: Record<string, ICourse>;

  // UI States
  searchQuery: string;
  storeAction: StoreAction;
  loader: boolean;
  error: string | null;
}
