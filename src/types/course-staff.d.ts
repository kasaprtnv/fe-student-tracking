export interface ICourseStaff {
  id: string;
  courseId: string;
  staffId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICourseStaffCreateDTO {
  courseId: string;
  staffId: string;
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
