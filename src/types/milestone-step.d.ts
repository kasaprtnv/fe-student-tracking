export interface IMilestoneStep {
  id: string;
  milestoneId: string;
  name: string;
  description?: string;
  position: number;
  requiresAttachment: boolean;
  notifyBeforeDays?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  milestoneName?: string;
  dayPeriod?: number;
}

export interface IMilestoneStepCreateDTO {
  milestoneId: string;
  name: string;
  description?: string;
  position: number;
  requiresAttachment: boolean;
  deadlineDate?: Date;
  notifyBeforeDays?: number;
  isActive?: boolean;
}

export interface MilestoneStepState {
  // Data
  milestoneStepMap: Record<string, IMilestoneStep>;

  // UI States
  searchQuery: string;
  storeAction: StoreAction;
  loader: boolean;
  error: string | null;
}

export interface IMilestoneStepUpdateDTO {
  parentStepId?: string | null;
  name?: string;
  description?: string | null;
  position?: number;
  requiresAttachment?: boolean;
  allowedFileTypes?: string | null;
  deadlineDate?: Date | null;
  notifyBeforeDays?: number | null;
  isActive?: boolean;
}
