export interface IDashboardStats {
  totalTeachers: number;
}

export interface IGraduationStatsByYear {
  year: string;
  graduated: number;
  notGraduated: number;
}

export interface DashboardState {
  stats: IDashboardStats | null;
  graduationStats: IGraduationStatsByYear[];
  loader: boolean;
  error: string | null;
}
