import { Student } from '@/types/student';
import {
  SelectOption,
  IApiGetResponse,
  IApiPostResponse,
  IApiPatchResponse,
  IApiDeleteResponse,
} from '@/types/index';
import { APIService } from '@/services/api.service';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class StudentService extends APIService {
  constructor(baseURL?: string) {
    super(baseURL ?? API_BASE_URL);
  }

  async getAll(): Promise<IApiGetResponse<Student>> {
    return this.get('/students')
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getById(id: string): Promise<Student> {
    return this.get(`/students/${id}`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getOptions(): Promise<IApiGetResponse<SelectOption>> {
    return this.get('/students/options')
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async create(data: Omit<Student, 'id'>): Promise<IApiPostResponse<Student>> {
    return this.post('/students', data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async update(
    id: string,
    data: Partial<Student>,
  ): Promise<IApiPatchResponse<Student>> {
    return this.patch(`/students/${id}`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async deleteById(id: string): Promise<IApiDeleteResponse> {
    return this.delete(`/students/${id}`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async deleteMultiple(ids: string[]): Promise<IApiDeleteResponse> {
    return this.delete('/students/bulk-delete', ids)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async importStudents(
    students: Omit<Student, 'id'>[],
  ): Promise<IApiPostResponse<Student[]>> {
    return this.post('/students/import', students)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}

export const studentService = new StudentService();
