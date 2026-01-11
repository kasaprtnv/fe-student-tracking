import {
  IApiGetResponse,
  IApiPatchResponse,
  IApiGetByIdResponse,
} from '@/types/index';
import { APIService } from './api.service';
import { IStudentStepProgress } from '@/types/student-step-progress';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class StudentStepProgressService extends APIService {
  constructor(baseURL?: string) {
    super(baseURL ?? API_BASE_URL);
  }

  // ดึงรายการที่รอตรวจสอบทั้งหมด
  async getAllPending(): Promise<IApiGetResponse<IStudentStepProgress>> {
    return this.get('/student-step-progress?status=pending')
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  // ดึงรายการทั้งหมด
  async getAll(params?: {
    status?: string;
    stepId?: string;
    studentId?: string;
  }): Promise<IApiGetResponse<IStudentStepProgress>> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.stepId) queryParams.append('stepId', params.stepId);
    if (params?.studentId) queryParams.append('studentId', params.studentId);

    const queryString = queryParams.toString();
    return this.get(
      `/student-step-progress${queryString ? `?${queryString}` : ''}`,
    )
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  // ดึงรายละเอียดตาม id
  async getById(
    id: string,
  ): Promise<IApiGetByIdResponse<IStudentStepProgress>> {
    return this.get(`/student-step-progress/${id}`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  // อนุมัติ
  async approve(
    id: string,
    reviewedBy: string,
  ): Promise<IApiPatchResponse<IStudentStepProgress>> {
    return this.patch(`/student-step-progress/${id}/approve`, { reviewedBy })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  // ปฏิเสธ
  async decline(
    id: string,
    reviewedBy: string,
    declineReason: string,
  ): Promise<IApiPatchResponse<IStudentStepProgress>> {
    return this.patch(`/student-step-progress/${id}/decline`, {
      reviewedBy,
      declineReason,
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  // อัพเดทสถานะเป็น pending เมื่ออัพโหลดไฟล์
  async submitForReview(
    stepId: string,
    studentId: string,
  ): Promise<IApiPatchResponse<IStudentStepProgress>> {
    return this.patch(`/student-step-progress/submit`, {
      stepId,
      studentId,
      status: 'pending',
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}

export const studentStepProgressService = new StudentStepProgressService();
