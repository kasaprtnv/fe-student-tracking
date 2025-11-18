export interface IMilestone {
  id: string;
  courseId: string;
  name: string;
  description: string;
  position: number;
  notifyReceiverEmail: string;
  deadlineDate: string;
  notifyBeforeDays: number;
  isActive: boolean;
}

export interface IMilestoneCreateDTO {
  courseId: string;
  name: string;
  description: string;
  position: number;
  notifyReceiverEmail: string;
  deadlineDate: string;
  notifyBeforeDays: number;
}

export interface MilestoneState {
  // Data
  milestonemap: Record<string, IMilestone>;

  // UI States
  searchQuery: string;
  storeAction: StoreAction;
  loader: boolean;
  error: string | null;
}
