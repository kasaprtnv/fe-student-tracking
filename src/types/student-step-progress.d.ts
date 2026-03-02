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
  staffAttachmentId?: string;
  studentCode?: string;
  studentName?: string;
  courseCode?: string;
  courseName?: string;
  stepName?: string;
  fileName?: string;
  fileUrl?: string;
  fileKey?: string;
  studentDegree?: string;
  studentYear?: string;
  degree?: string;
  year?: string;
  student?: {
    id: string;
    code: string;
    firstName: string;
    lastName: string;
    courseId?: string;
    courseCode?: string;
    courseName?: string;
    degree?: string;
    year?: string;
  };
  step?: {
    id: string;
    name: string;
    milestoneId: string;
    requiresAttachment?: boolean;
  };
  studentComment?: string;
  attachment?: {
    id: string;
    fileName: string;
    fileKey?: string;
    fileUrl?: string;
    mimeType?: string;
  };
  // Staff attachment (for decline case)
  staffAttachment?: {
    id: string;
    fileName: string;
    fileKey?: string;
    fileUrl?: string;
    mimeType?: string;
  };
  // Multiple attachments array
  attachments?: {
    attachmentId: string;
    fileName: string;
    fileKey?: string;
    fileSize?: number;
    mimeType?: string;
    fileUrl?: string;
  }[];
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
