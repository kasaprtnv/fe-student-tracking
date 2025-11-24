// milestonestep.d.ts

export interface IMilestoneStep {
  id: string;
  milestoneId: string;
  parentStepId?: string | null;

  name: string;
  description?: string | null;

  position: number;

  requiresAttachment: boolean;
  allowedFileTypes?: string | null;

  deadlineDate?: Date | null;
  notifyBeforeDays?: number | null;

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export interface IMilestoneStepCreateDTO {
  milestoneId: string;
  parentStepId?: string | null;

  name: string;
  description?: string | null;

  position: number;

  requiresAttachment: boolean;
  allowedFileTypes?: string | null;

  deadlineDate?: Date | null;
  notifyBeforeDays?: number | null;

  isActive?: boolean;
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

export interface MilestoneStepState {
  milestonestepMap: Record<string, IMilestoneStep>;
  storeAction: 'none' | 'creating' | 'updating' | 'deleting';
  loader: boolean;
  error: string | null;
}
