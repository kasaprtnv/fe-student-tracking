import { User, UserRole } from '@/types/user';
import { APIService } from '@/services/api.service';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class UserService extends APIService {
  constructor(baseURL?: string) {
    super(baseURL ?? API_BASE_URL);
  }

  async getAll(): Promise<User[]> {
    return this.get('/users')
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getByRole(role: UserRole): Promise<User[]> {
    return this.get(`/users?role=${role}`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getStudents(): Promise<User[]> {
    return this.getByRole('student');
  }

  async getById(id: string): Promise<User> {
    return this.get(`/users/${id}`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}

export const userService = new UserService();
