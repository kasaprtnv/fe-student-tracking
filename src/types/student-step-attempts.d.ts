import { StepProgressStatus } from './student-step-progress';

export enum Decision {
  APPROVED = 'approved',
  DECLINED = 'declined',
}

export interface StudentStepAttempts {
  id: string;
  approverUserId: string;
  decision: Decision;
  attachmentId?: string;
  studentComment?: string;
  staffAttachmentId?: string;
  staffComment?: string;
  attemptNo: number;
  stepProgress: StudentStepProgress;
  staffAttachment: Attachment;
}

export interface Attachment {
  id: string;
  studentStepProgressId: string;
  uploadedByUserId: string;
  fileKey: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
}

export interface StudentStepProgress {
  id: string;
  userId: string;
  mileStoneStepId: string;
  dueDate?: string;
  status: StepProgressStatus;
}

export interface StudentStepAttemptsState {
  // Date
  studentStepAttemptsMap: Record<string, StudentStepAttempts>;

  // UI States
  loader: boolean;
  error: string | null;
}
