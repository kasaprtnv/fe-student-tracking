import {
  IApiGetResponse,
  IApiPatchResponse,
  IApiGetByIdResponse,
} from '@/types/index';
import { APIService } from './api.service';
import { IStudentStepProgress } from '@/types/student-step-progress';
import { StudentStepAttempts } from '@/types/student-step-attempts';

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

  async getAttemptsByUserId(
    userId: string,
  ): Promise<IApiGetResponse<StudentStepAttempts>> {
    return this.get(`/student-step-progress/${userId}/attempts`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  // ดึง attempts ตาม progressId
  async getAttemptsByProgressId(
    progressId: string,
  ): Promise<IApiGetResponse<StudentStepAttempts>> {
    return this.get(`/student-step-progress/${progressId}/progress-attempts`)
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
    staffAttachmentFile?: File,
  ): Promise<IApiPatchResponse<IStudentStepProgress>> {
    const formData = new FormData();
    formData.append('reviewedBy', reviewedBy);
    formData.append('declineReason', declineReason);
    if (staffAttachmentFile) {
      formData.append('staffAttachmentFile', staffAttachmentFile);
    }
    return fetch(`${this.baseURL}/student-step-progress/${id}/decline`, {
      method: 'PATCH',
      body: formData,
    })
      .then(async (response) => {
        if (!response.ok) throw await response.json();
        return response.json();
      })
      .catch((error) => {
        throw error;
      });
  }

  // อัพเดทสถานะเป็น pending เมื่ออัพโหลดไฟล์
  async submitForReview(
    stepId: string,
    studentId: string,
    studentComment?: string,
  ): Promise<IApiPatchResponse<IStudentStepProgress>> {
    return this.patch(`/student-step-progress/submit`, {
      stepId,
      studentId,
      status: 'pending',
      studentComment,
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}

export const studentStepProgressService = new StudentStepProgressService();
