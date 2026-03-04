import { APIService } from './api.service';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_STATIC_URL =
  process.env.NEXT_PUBLIC_STATIC_URL || 'http://localhost:3001/static';

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
  attemptId?: string; // รหัส attempt ที่ attachment นี้ถูกอัปโหลด
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

  /**
   * รองรับทั้งไฟล์เดียวและหลายไฟล์ (file: File | File[])
   */
  async createAttachment(
    stepId: string,
    fileOrFiles: File | File[],
    uploadedByUserId?: string,
  ): Promise<UploadResponse> {
    if (!uploadedByUserId) {
      return {
        success: false,
        error: 'User ID is required. Please make sure you are logged in.',
      };
    }

    try {
      // ถ้าเป็น array ให้ส่งทีละไฟล์ (field 'file')
      if (Array.isArray(fileOrFiles)) {
        for (const file of fileOrFiles) {
          const formData = new FormData();
          formData.append('file', file);
          const endpoint = `${API_BASE_URL}/attachment/upload-by-step?stepId=${stepId}&userId=${uploadedByUserId}`;
          const response = await fetch(endpoint, {
            method: 'POST',
            body: formData,
          });
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Upload failed');
          }
        }
        return { success: true };
      } else {
        // ไฟล์เดียว
        const formData = new FormData();
        formData.append('file', fileOrFiles);
        const endpoint = `${API_BASE_URL}/attachment/upload-by-step?stepId=${stepId}&userId=${uploadedByUserId}`;
        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Upload failed');
        }
        const data = await response.json();
        return {
          success: true,
          data: data.data || data,
        };
      }
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

  // ดึง attachments ตาม attemptId (เฉพาะรอบที่ระบุ)
  async getAttachmentsByAttemptId(attemptId: string): Promise<AttachmentDTO[]> {
    try {
      const response = await this.get(`/attachment/attempt/${attemptId}`);
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
    } catch {
      return [];
    }
  }

  // ดึง attachments เฉพาะจากรอบที่ถูก approved
  async getApprovedAttachmentsByProgress(
    progressId: string,
  ): Promise<AttachmentDTO[]> {
    try {
      const response = await this.get(
        `/attachment/approved-progress/${progressId}`,
      );
      console.log(
        'DEBUG getApprovedAttachmentsByProgress response:',
        progressId,
        response,
      );
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
    } catch (error) {
      console.error(
        'DEBUG getApprovedAttachmentsByProgress error:',
        progressId,
        error,
      );
      return [];
    }
  }

  // ดึง URL สำหรับดู/ดาวน์โหลดไฟล์

  getFileUrl(fileKey: string): string {
    if (!fileKey) return '';
    if (fileKey.startsWith('http://') || fileKey.startsWith('https://')) {
      return fileKey;
    }
    let cleanKey = fileKey;
    if (cleanKey.startsWith('attachments/')) {
      cleanKey = cleanKey
        .replace(/^attachments\//, '')
        .replace(/^attachments\//, '');
    }
    return `${API_STATIC_URL}/attachments/${cleanKey}`;
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

  // ลบ attachment (soft delete)
  async deleteAttachment(id: string): Promise<SubmitResponse> {
    try {
      await this.patch(`/attachment/${id}/soft-delete`, {});
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed',
      };
    }
  }

  // อัพโหลดไฟล์แนบสำหรับ staff (กรณีปฏิเสธพร้อมแนบไฟล์)
  // รองรับทั้งไฟล์เดียวและหลายไฟล์
  async uploadStaffAttachment(
    stepId: string,
    fileOrFiles: File | File[],
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

      // รองรับทั้ง single file และ multiple files
      if (Array.isArray(fileOrFiles)) {
        // ส่งหลายไฟล์ใน request เดียว
        for (const file of fileOrFiles) {
          formData.append('files', file);
        }
      } else {
        // ไฟล์เดียว
        formData.append('files', fileOrFiles);
      }

      // ใช้ endpoint upload-multiple-by-step สำหรับส่งหลายไฟล์ในครั้งเดียว
      const response = await fetch(
        `${API_BASE_URL}/attachment/upload-multiple-by-step?stepId=${stepId}&userId=${uploadedByUserId}`,
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
