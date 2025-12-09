import { APIService } from './api.service';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface AttachmentDTO {
  id?: string;
  studentStepProgressId: string;
  uploadedByUserId?: string;
  fileName?: string;
  fileKey?: string;
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

  // สร้าง attachment record ใน database
  async createAttachment(
    stepId: string,
    file: File,
    uploadedByUserId?: string,
  ): Promise<UploadResponse> {
    // ตรวจสอบ userId ก่อน
    if (!uploadedByUserId) {
      return {
        success: false,
        error: 'User ID is required. Please make sure you are logged in.',
      };
    }

    try {
      const response = await this.post(
        `/attachment/upload-by-step?stepId=${stepId}&userId=${uploadedByUserId}`,
        {
          fileName: file.name,
          fileSize: String(file.size),
          mimeType: file.type,
        },
      );

      return {
        success: true,
        data: response.data,
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
    return response.data;
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
}

export const uploadService = new UploadService();
