// Types
export type MilestoneStepStatus =
  | 'approved'
  | 'pending'
  | 'declined'
  | 'available'
  | 'locked';

export interface UploadedFilesMap {
  [stepId: string]: string;
}

export type ViewMode = 'readonly' | 'upload' | 'edit';

export interface IMilestone {
  id: string;
  courseId: string;
  name: string;
  description?: string;
  position: number;
  notifyReceiverEmail: string;
  dayPeriod: number;
  notifyBeforeDays: number;
  isActive: boolean;
  steps?: MilestoneStep[];
}

export interface MilestoneStep {
  id: string;
  milestoneId: string;
  position: number;
  name: string;
  description: string;
  requiresAttachment: boolean;
  dayPeriod: number;
  isActive: boolean;
  status: MilestoneStepStatus;
}

export interface IMilestoneCreateDTO {
  courseId: string;
  name: string;
  description?: string;
  position: number;
  notifyReceiverEmail: string;
  dayPeriod: number;
  notifyBeforeDays: number;
}

export interface MilestoneState {
  // Data
  milestoneMap: Record<string, IMilestone>;

  // UI States
  searchQuery: string;
  storeAction: StoreAction;
  loader: boolean;
  error: string | null;
}
