// Types
export interface MilestoneStep {
  id: string;
  milestoneId: string;
  position: number;
  name: string;
  description: string;
  requiresAttachment: boolean;
  allowedFileTypes?: string;
  deadlineDate: string;
  isActive: boolean;
  completed: boolean;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  steps: MilestoneStep[];
}

export interface UploadedFilesMap {
  [stepId: string]: string;
}

export interface IMilestone {
  id: string;
  courseId: string;
  name: string;
  description?: string;
  position: number;
  notifyReceiverEmail: string;
  deadlineDate: Date;
  notifyBeforeDays: number;
  isActive: boolean;
}

export interface IMilestoneCreateDTO {
  courseId: string;
  name: string;
  description?: string;
  position: number;
  notifyReceiverEmail: string;
  deadlineDate: Date;
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
