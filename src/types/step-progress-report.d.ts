export interface IStepProgressReport {
  progressId: string;
  stepId: string;
  stepName: string;
  milestoneId: string;
  milestoneName: string;
  courseId: string;
  courseName: string;
  dueDate: string;
  status: 'locked' | 'pending_approval' | 'declined' | 'approved' | 'available';
  studentId: string;
  studentCode: string;
  studentFirstName: string;
  studentLastName: string;
  studentYear: string;
  studentMajor: string;
  studentDegree: string;
}

export interface IStepProgressReportFilter {
  stepIds?: string[];
  milestoneIds?: string[];
  courseIds?: string[];
  statuses?:
    | 'locked'
    | 'pending_approval'
    | 'declined'
    | 'approved'
    | 'available'[];
  degrees?: string[];
  years?: string[];
  major?: string;
  currentUserId?: string;
}

export interface StepProgressReportState {
  // Data
  stepProgressReportMap: Record<string, IStepProgressReport>;

  // UI States
  searchQuery: string;
  loader: boolean;
}
