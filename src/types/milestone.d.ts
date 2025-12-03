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
  isUsed: boolean;
  updatedAt: Date;
  createdAt: Date;
  steps?: MilestoneStep[];
}

export interface MilestoneStep {
  id: string;
  milestoneId: string;
  name: string;
  description?: string;
  position: number;
  requiresAttachment: boolean;
  dayPeriod: number;
  notifyBeforeDays?: number;
  isUsed: boolean;
  createdAt: Date;
  updatedAt: Date;
  milestoneName?: string;
  status: MilestoneStepStatus;
}

export interface IMilestoneCreateDTO {
  name: string;
  description?: string;
  notifyReceiverEmail: string;
  dayPeriod: number;
  notifyBeforeDays: number;
}

export interface MilestoneState {
  // Data
  milestoneMap: Record<string, IMilestone>;
  allMilestoneIds: string[];
  // UI States
  searchQuery: string;
  storeAction: StoreAction;
  loader: boolean;
  error: string | null;
}
