export interface ICourseStaff {
  id: string;
  courseId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICourseStaffCreateDTO {
  courseId: string;
  userId: string;
}

export interface CourseStaffState {
  // Data
  courseStaffMap: Record<string, ICourseStaff>;

  // UI States
  searchQuery: string;
  storeAction: StoreAction;
  loader: boolean;
  error: string | null;
}
