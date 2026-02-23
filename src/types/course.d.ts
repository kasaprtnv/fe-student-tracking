import { IPagination } from '.';
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
  degreeTH?: string;
  degreeEN?: string;
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
  pagination: IPagination;
}

// types/course-milestone.ts
export interface CourseMilestoneDTO {
  id: string;
  courseId: string;
  milestoneId: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseMilestonesState {
  // Data
  milestonesMap: Record<string, CourseMilestoneDTO[]>; // key: courseId

  // UI
  loader: boolean;
  error: string | null;
}
