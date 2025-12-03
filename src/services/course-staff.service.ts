import { ICourseStaff } from '@/types/course-staff';
import {
  IApiDeleteResponse,
  IApiGetResponse,
  IApiPatchResponse,
  IApiPostResponse,
} from '@/types/index';
import { APIService } from './api.service';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class CourseStaffService extends APIService {
  constructor(baseURL?: string) {
    super(baseURL ?? API_BASE_URL);
  }

  async getAllCourseStaff(): Promise<IApiGetResponse<ICourseStaff>> {
    return this.get('/course-staff')
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getCourseStaffById(id: string): Promise<ICourseStaff> {
    return this.get(`/course-staff/${id}`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getCourseStaffByCourseId(
    courseId: string,
  ): Promise<IApiGetResponse<ICourseStaff>> {
    return this.get(`/course-staff/by-course/${courseId}`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async createCourseStaff(
    data: Partial<ICourseStaff>,
  ): Promise<IApiPostResponse<ICourseStaff>> {
    return this.post('/course-staff', data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async updateCourseStaff(
    id: string,
    data: Partial<ICourseStaff>,
  ): Promise<IApiPatchResponse<ICourseStaff>> {
    return this.patch(`/course-staff/${id}`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async deleteCourseStaff(id: string): Promise<IApiDeleteResponse> {
    return this.delete(`/course-staff/${id}`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}

export const courseStaffService = new CourseStaffService();
