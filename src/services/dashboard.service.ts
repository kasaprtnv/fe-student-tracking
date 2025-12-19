import { IDashboardStats } from '@/types/dashboard';
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

  async getGraduationStatsByYear(
    courseId?: string,
    degree?: string,
  ): Promise<{
    data: { year: string; graduated: number; notGraduated: number }[];
    message: string;
  }> {
    const params = new URLSearchParams();
    if (courseId) params.append('courseId', courseId);
    if (degree) params.append('degree', degree);
    const queryString = params.toString();
    const url = queryString
      ? `/dashboard/graduation-stats-by-year?${queryString}`
      : '/dashboard/graduation-stats-by-year';
    return this.get(url)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}

export const dashboardService = new DashboardService();
