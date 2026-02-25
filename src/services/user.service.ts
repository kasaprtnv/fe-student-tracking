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

class UserService extends APIService {
  constructor(baseURL?: string) {
    super(baseURL ?? API_BASE_URL);
  }

  async getAll(
    page?: number,
    pageSize?: number,
    role?: UserRole,
  ): Promise<IApiGetResponse<User>> {
    const params = new URLSearchParams();
    if (page !== undefined) params.append('page', String(page));
    if (pageSize !== undefined) params.append('limit', String(pageSize));

    if (role) params.append('role', role);

    const query = params.toString();
    const url = query ? `/users?${query}` : '/users';

    return this.get(url)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async searchUsers(
    searchQuery: string,
    page: number,
    pageSize: number,
    role?: UserRole,
  ): Promise<IApiGetResponse<User>> {
    let url = `/users/search?query=${encodeURIComponent(searchQuery)}&page=${page}&pageSize=${pageSize}`;
    if (role) url += `&role=${role}`;
    return this.get(url)
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

  async uploadProfile(
    id: string,
    file: File,
  ): Promise<IApiPostResponse<{ profileUrl: string }>> {
    const formData = new FormData();
    formData.append('profile', file);
    return this.post(`/users/upload-profile-image/${id}`, formData)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async createUser(data: Partial<User>): Promise<IApiPostResponse<User>> {
    // Determine allowed fields based on role
    const isTeacher = data.role === 'teacher';

    const allowedFields = isTeacher
      ? [
          'titleId',
          'firstName',
          'lastName',
          'email',
          'phone',
          'role',
          'courseId',
          'teacherDegree',
          'academicPosition',
        ]
      : [
          'code',
          'titleId',
          'firstName',
          'lastName',
          'email',
          'phone',
          'degree',
          'year',
          'studyPlan',
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

    return this.post('/users/create', filteredData)
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
      ? [
          'titleId',
          'firstName',
          'lastName',
          'email',
          'phone',
          'role',
          'courseId',
          'teacherDegree',
          'academicPosition',
          'isActive',
        ]
      : [
          'code',
          'titleId',
          'firstName',
          'lastName',
          'email',
          'phone',
          'degree',
          'year',
          'studyPlan',
          'role',
          'courseId',
          'enrollDate',
          'isActive',
        ];

    // Fields that can be cleared (empty string should be sent to backend)
    // isActive is included because `false` is a valid value that must not be filtered out
    const clearableFields = ['academicPosition', 'teacherDegree', 'isActive'];

    const filteredData: Record<string, unknown> = {};
    for (const key of allowedFields) {
      const value = data[key as keyof User];
      // For clearable fields, include even if empty string (to allow clearing)
      // For other fields, only include if they have actual values
      if (clearableFields.includes(key)) {
        if (value !== undefined && value !== null) {
          filteredData[key] = value;
        }
      } else if (value !== undefined && value !== null && value !== '') {
        filteredData[key] = value;
      }
    }

    return this.patch(`/users/${id}`, filteredData)
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

  async getStudentProgressCount(userId: string): Promise<number> {
    return this.get(`/student-step-progress/count/${userId}`)
      .then((response) => response?.data?.count || 0)
      .catch((error) => {
        console.error('Error fetching student progress count:', error);
        return 0; // Return 0 if error, to avoid blocking update
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
