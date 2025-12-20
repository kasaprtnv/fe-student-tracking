import { StoreAction } from '@/types/index';

export type StepProgressStatus =
  | 'pending approval'
  | 'approved'
  | 'declined'
  | 'available'
  | 'locked';

export interface IStudentStepProgress {
  id: string;
  studentId: string;
  stepId?: string;
  status: StepProgressStatus;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  declineReason?: string;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
  // Flat fields from API
  studentCode?: string;
  studentName?: string;
  courseName?: string;
  stepName?: string;
  fileName?: string;
  fileUrl?: string;
  // Joined fields (alternative structure)
  student?: {
    id: string;
    code: string;
    firstName: string;
    lastName: string;
    courseName?: string;
  };
  step?: {
    id: string;
    name: string;
    milestoneId: string;
  };
  attachment?: {
    id: string;
    fileName: string;
    fileKey?: string;
    fileUrl?: string;
    mimeType?: string;
  };
}

export interface IStudentStepProgressState {
  // Data
  progressMap: Record<string, IStudentStepProgress>;

  // UI States
  searchQuery: string;
  storeAction: StoreAction;
  loader: boolean;
  error: string | null;
}
