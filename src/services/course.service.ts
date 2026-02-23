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
  ): Promise<IApiGetResponse<ICourse>> {
    let url = '/courses';
    if (page !== undefined && pageSize !== undefined) {
      url += `?page=${page}&pageSize=${pageSize}`;
    }

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
  ): Promise<IApiGetResponse<ICourse>> {
    return this.get(
      `/courses/search?query=${encodeURIComponent(searchQuery)}&page=${page}&pageSize=${pageSize}`,
    )
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
