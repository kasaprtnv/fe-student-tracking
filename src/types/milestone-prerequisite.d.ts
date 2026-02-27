export interface IMilestonePrerequisite {
  id: string;
  targetMilestoneId?: string;
  targetStepId?: string;
  requiredMilestoneId?: string;
  requiredStepId?: string;
  createdAt?: string;
  updatedAt?: string;
  courseId?: string;
}

export interface MilestonePrerequisiteState {
  prerequisiteMap: Record<string, IMilestonePrerequisite>;
  searchQuery: string;
  storeAction: 'none' | 'creating' | 'updating' | 'deleting';
  loader: boolean;
  error: string | null;
}

export interface MilestonePrerequisiteDTO {
  id?: string;

  targetMilestoneId?: string;
  targetStepId?: string;

  requiredMilestoneId?: string;
  requiredStepId?: string;
  courseId?: string;
}

export interface UnlockCondition {
  type: 'milestone' | 'step';
  id: string;
}
