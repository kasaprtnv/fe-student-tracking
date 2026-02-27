import { ICourse, ICourseCreateDTO } from '@/types/course';
import {
  IApiDeleteResponse,
  IApiDeleteManyResponse,
  IApiGetResponse,
  IApiPatchResponse,
  IApiPostResponse,
} from '@/types/index';
import { APIService } from './api.service';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class CourseService extends APIService {
  constructor(baseURL?: string) {
    super(baseURL ?? API_BASE_URL);
  }

  async getAllCourses(
    page?: number,
    pageSize?: number,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
  ): Promise<IApiGetResponse<ICourse>> {
    const params = new URLSearchParams();
    if (page !== undefined) params.append('page', String(page));
    if (pageSize !== undefined) params.append('pageSize', String(pageSize));
    if (sortBy) {
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder || 'asc');
    }
    const query = params.toString();
    const url = query ? `/courses?${query}` : '/courses';
    return this.get(url)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async searchCourses(
    searchQuery: string,
    page: number,
    pageSize: number,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
  ): Promise<IApiGetResponse<ICourse>> {
    const params = new URLSearchParams();
    if (searchQuery !== undefined) params.append('query', searchQuery);
    if (page !== undefined) params.append('page', String(page));
    if (pageSize !== undefined) params.append('pageSize', String(pageSize));

    if (sortBy) {
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder || 'asc');
    }
    const query = params.toString();
    const url = query ? `/courses/search?${query}` : '/courses/search';
    return this.get(url)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getCourseById(id: string): Promise<ICourse> {
    return this.get(`/courses/${id}`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async createCourse(
    data: ICourseCreateDTO,
  ): Promise<IApiPostResponse<ICourse>> {
    return this.post('/courses', data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async createCourseWithStaff(
    data: ICourseCreateDTO,
  ): Promise<IApiPostResponse<ICourse>> {
    return this.post('/courses/with-staff', data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async updateCourse(
    id: string,
    data: Partial<ICourse>,
  ): Promise<IApiPatchResponse<ICourse>> {
    return this.patch(`/courses/${id}`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async deleteCourse(id: string): Promise<IApiDeleteResponse> {
    return this.delete(`/courses/${id}`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async deleteMultipleCourses(
    courseIds: string[],
  ): Promise<IApiDeleteManyResponse> {
    return this.delete('/courses/bulk-delete', { ids: courseIds })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}

export const courseService = new CourseService();
