import { APIService } from './api.service';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface AttachmentDTO {
  id?: string;
  studentStepProgressId: string;
  uploadedByUserId?: string;
  fileName?: string;
  fileKey?: string;
  fileUrl?: string;
  fileSize?: string;
  mimeType?: string;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UploadResponse {
  success: boolean;
  data?: AttachmentDTO;
  error?: string;
}

export interface SubmitResponse {
  success: boolean;
  error?: string;
}

class UploadService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  async createAttachment(
    stepId: string,
    file: File,
    uploadedByUserId?: string,
  ): Promise<UploadResponse> {
    if (!uploadedByUserId) {
      return {
        success: false,
        error: 'User ID is required. Please make sure you are logged in.',
      };
    }

    try {
      // สร้าง FormData สำหรับอัปโหลดไฟล์ (เฉพาะ file ตามตัวอย่าง)
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `${API_BASE_URL}/attachment/upload-by-step?stepId=${stepId}&userId=${uploadedByUserId}`,
        {
          method: 'POST',
          body: formData,
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Upload failed');
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  // ดึง attachments ทั้งหมด
  async getAllAttachments(): Promise<AttachmentDTO[]> {
    const response = await this.get('/attachment');
    return response.data;
  }

  // ดึง attachment ตาม id
  async getAttachmentById(id: string): Promise<AttachmentDTO> {
    const response = await this.get(`/attachment/${id}`);
    return response.data;
  }

  // ดึง attachments ตาม studentStepProgressId
  async getAttachmentsByProgress(
    studentStepProgressId: string,
  ): Promise<AttachmentDTO[]> {
    const response = await this.get(
      `/attachment/progress/${studentStepProgressId}`,
    );
    console.log('DEBUG getAttachmentsByProgress response:', response);
    // Axios: response.data.data (array)
    if (Array.isArray(response)) {
      return response;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  }
  // ดึง URL สำหรับดู/ดาวน์โหลดไฟล์
  getFileUrl(fileKey: string): string {
    if (!fileKey) return '';

    // ถ้าเป็น URL เต็มแล้ว
    if (fileKey.startsWith('http://') || fileKey.startsWith('https://')) {
      return fileKey;
    }

    // ถ้าเป็น path ให้เติม base URL
    return `${API_BASE_URL}/attachment/file/${fileKey}`;
  }

  // อัพเดท attachment
  async updateAttachment(
    id: string,
    data: Partial<AttachmentDTO>,
  ): Promise<UploadResponse> {
    try {
      const response = await this.put(`/attachment/${id}`, data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Update failed',
      };
    }
  }

  // ลบ attachment
  async deleteAttachment(id: string): Promise<SubmitResponse> {
    try {
      await this.delete(`/attachment/${id}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed',
      };
    }
  }

  // อัพโหลดไฟล์แนบสำหรับ staff (กรณีปฏิเสธพร้อมแนบไฟล์)
  async uploadStaffAttachment(
    stepId: string,
    file: File,
    uploadedByUserId: string,
  ): Promise<UploadResponse> {
    if (!uploadedByUserId) {
      return {
        success: false,
        error: 'User ID is required. Please make sure you are logged in.',
      };
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      // ใช้ endpoint upload-by-step เหมือน attachment ปกติ
      const response = await fetch(
        `${API_BASE_URL}/attachment/upload-by-step?stepId=${stepId}&userId=${uploadedByUserId}`,
        {
          method: 'POST',
          body: formData,
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Upload failed');
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  // ดึง staff attachment ตาม progressId
  async getStaffAttachmentByProgress(
    progressId: string,
  ): Promise<AttachmentDTO | null> {
    try {
      const response = await this.get(
        `/attachment/staff-progress/${progressId}`,
      );
      return response.data || null;
    } catch {
      return null;
    }
  }
}

export const uploadService = new UploadService();
