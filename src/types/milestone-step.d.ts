export interface IMilestoneStep {
  id: string;
  milestoneId: string;
  name: string;
  description?: string;
  position: number;
  requiresAttachment: boolean;
  dayPeriod: number;
  notifyBeforeDays?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  milestoneName?: string;
}

export interface IMilestoneStepCreateDTO {
  milestoneId: string;
  name: string;
  description?: string;
  position: number;
  requiresAttachment: boolean;
  deadlineDate?: Date;
  notifyBeforeDays?: number;
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
