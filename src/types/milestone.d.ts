// Types
export type MilestoneStepStatus =
  | 'approved'
  | 'pending approval'
  | 'declined'
  | 'available'
  | 'locked';

export interface UploadedFilesMap {
  [stepId: string]: string;
}

export type ViewMode = 'readonly' | 'upload' | 'edit';

export interface IMilestone {
  id: string;
  name: string;
  description?: string;
  dayPeriod: number;
  notifyBeforeDays: number;
  isUsed: boolean;
  updatedAt: string | Date;
  createdAt: string | Date;
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
  declineReason?: string;
  staffAttachment?: {
    id: string;
    fileName: string;
    fileKey?: string;
    fileUrl?: string;
  };
  staffAttachmentId?: string;
}

export interface IMilestoneCreateDTO {
  name: string;
  description?: string;
  dayPeriod: number;
  notifyBeforeDays: number;
}

export interface MilestoneState {
  // Data
  milestoneMap: Record<string, IMilestone>;
  allMilestoneIds: string[];
  // course-milestone
  courseMilestones: {
    byCourseId: Record<
      string,
      {
        order: string[]; // array of courseMilestoneId
        map: Record<string, ICourseMilestone>;
      }
    >;
  };
  // UI States
  searchQuery: string;
  storeAction: StoreAction;
  loader: boolean;
  error: string | null;
}

export interface ICourseMilestone {
  id: string;
  courseId: string;
  milestoneId: string;
  position: number;

  milestone: IMilestone;
}
