import {
  IDashboardStats,
  IMilestoneStats,
  IMilestoneStatsByYear,
} from '@/types/dashboard';
import { IApiGetByIdResponse } from '@/types/index';
import { APIService } from './api.service';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class DashboardService extends APIService {
  constructor(baseURL?: string) {
    super(baseURL ?? API_BASE_URL);
  }

  async getDashboardStats(): Promise<IApiGetByIdResponse<IDashboardStats>> {
    return this.get('/dashboard/stats')
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getMilestoneStats(
    courseId?: string,
    year?: string,
  ): Promise<IApiGetByIdResponse<IMilestoneStats>> {
    const params = new URLSearchParams();
    if (courseId) params.append('courseId', courseId);
    if (year) params.append('year', year);
    const queryString = params.toString();
    const url = `/dashboard/milestone-stats${queryString ? `?${queryString}` : ''}`;
    return this.get(url)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getMilestoneStatsByYear(
    courseId?: string,
  ): Promise<IApiGetByIdResponse<IMilestoneStatsByYear>> {
    const url = courseId
      ? `/dashboard/milestone-stats-by-year?courseId=${courseId}`
      : '/dashboard/milestone-stats-by-year';
    return this.get(url)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}

export const dashboardService = new DashboardService();
