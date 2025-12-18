export interface IDashboardStats {
  totalMilestones: number;
  totalTeachers: number;
}

export interface IMilestoneStats {
  approved: number;
  inProgress: number;
  overdue: number;
  total: number;
}

export interface IMilestoneStatsByYearItem {
  year: string;
  approved: number;
  inProgress: number;
  overdue: number;
}

export interface IMilestoneStatsByYear {
  data: IMilestoneStatsByYearItem[];
}
