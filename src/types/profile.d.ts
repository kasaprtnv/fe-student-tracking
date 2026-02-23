export type StepStatus = 'approved' | 'pending' | 'rejected';
export interface ProfilePdfStep {
  id: string;
  name: string;
  status: StepStatus;
}
export interface ProfilePdfMilestone {
  id: string;
  name: string;
  description?: string;
  steps: ProfilePdfStep[];
}
export interface ProfileStep {
  id: string;
  title: string;
  status: StepStatus;
}
export interface ProfileMilestone {
  id: string;
  title: string;
  steps: ProfileStep[];
}
export interface UserProfile {
  id: string;
  code: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  major?: string;
  courseId?: string;
  courseName?: string;
  profileImageUrl?: string;

  progress: number;
}
export interface UserProfileWithMilestones extends UserProfile {
  milestones: ProfileMilestone[];
}
