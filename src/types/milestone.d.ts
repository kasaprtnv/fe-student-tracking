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
