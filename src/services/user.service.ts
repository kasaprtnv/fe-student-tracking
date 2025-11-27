import {
  IApiGetResponse,
  IApiPostResponse,
  IApiPatchResponse,
  IApiDeleteResponse,
} from '@/types/index';
import { APIService } from '@/services/api.service';
import { User } from '@/types/user';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

  async getById(id: string): Promise<User> {
    return this.get(`/users/${id}`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async create(data: Omit<User, 'id'>): Promise<IApiPostResponse<User>> {
    return this.post('/users', data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async update(
    id: string,
    data: Partial<User>,
  ): Promise<IApiPatchResponse<User>> {
    return this.patch(`/users/${id}`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async deleteById(id: string): Promise<IApiDeleteResponse> {
    return this.delete(`/users/${id}`)
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
}

export const userService = new UserService();
