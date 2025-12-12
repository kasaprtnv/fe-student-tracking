import { User, UserRole } from '@/types/user';
import { APIService } from '@/services/api.service';
import {
  IApiGetResponse,
  IApiDeleteResponse,
  IApiDeleteManyResponse,
  IApiPatchResponse,
  IApiPostResponse,
  IApiGetByIdResponse,
} from '@/types/index';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Helper function to convert camelCase to snake_case
function toSnakeCase(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const snakeKey = key.replace(
        /[A-Z]/g,
        (letter) => `_${letter.toLowerCase()}`,
      );
      result[snakeKey] = obj[key];
    }
  }
  return result;
}

class UserService extends APIService {
  constructor(baseURL?: string) {
    super(baseURL ?? API_BASE_URL);
  }

  async getAll(): Promise<IApiGetResponse<User>> {
    return this.get('/users')
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getByRole(role: UserRole): Promise<IApiGetResponse<User>> {
    return this.get(`/users?role=${role}`)
      .then((response) => response?.data || [])
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getStudents(): Promise<IApiGetResponse<User>> {
    return this.getByRole('student');
  }

  async getTeachers(): Promise<IApiGetResponse<User>> {
    return this.getByRole('teacher');
  }

  async getById(id: string): Promise<IApiGetByIdResponse<User>> {
    return this.get(`/users/${id}`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getProfile(): Promise<IApiGetByIdResponse<User>> {
    return this.get('/users/profile')
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getProfileWithToken(): Promise<IApiGetByIdResponse<User | null>> {
    return this.get('/users/profile/with-token')
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async createUser(data: Partial<User>): Promise<IApiPostResponse<User>> {
    // Determine allowed fields based on role
    const isTeacher = data.role === 'teacher';

    const allowedFields = isTeacher
      ? ['firstName', 'lastName', 'email', 'phone', 'role', 'courseId']
      : [
          'code',
          'firstName',
          'lastName',
          'email',
          'phone',
          'degree',
          'year',
          'role',
          'courseId',
          'enrollDate',
        ];

    const filteredData: Record<string, unknown> = {};
    for (const key of allowedFields) {
      const value = data[key as keyof User];
      if (value !== undefined && value !== null && value !== '') {
        filteredData[key] = value;
      }
    }

    const payload = toSnakeCase(filteredData);

    return this.post('/users/create', payload)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async updateUser(
    id: string,
    data: Partial<User>,
  ): Promise<IApiPatchResponse<User>> {
    // Determine allowed fields based on role
    const isTeacher = data.role === 'teacher';

    // Both teachers and students can have courseId
    const allowedFields = isTeacher
      ? ['firstName', 'lastName', 'email', 'phone', 'role', 'courseId']
      : [
          'code',
          'firstName',
          'lastName',
          'email',
          'phone',
          'degree',
          'year',
          'role',
          'courseId',
          'enrollDate',
        ];

    const filteredData: Record<string, unknown> = {};
    for (const key of allowedFields) {
      const value = data[key as keyof User];
      // Only include fields that have actual values (not undefined, not null, not empty string)
      if (value !== undefined && value !== null && value !== '') {
        filteredData[key] = value;
      }
    }

    const payload = toSnakeCase(filteredData);

    return this.patch(`/users/${id}`, payload)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async deleteUser(id: string): Promise<IApiDeleteResponse> {
    return this.delete(`/users/${id}`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async deleteMultipleUsers(
    userIds: string[],
  ): Promise<IApiDeleteManyResponse> {
    return this.delete('/users/bulk-delete', { ids: userIds })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async importUsers(file: File): Promise<IApiPostResponse<User[]>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.post('/users/import', formData)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}

export const userService = new UserService();
