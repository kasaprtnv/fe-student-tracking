import { IApiPostResponse } from '@/types';
import { APIService } from './api.service';
import { SignUp } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class AuthService extends APIService {
  constructor(baseURL?: string) {
    super(baseURL ?? API_BASE_URL);
  }

  async login(
    email: string,
    password: string,
  ): Promise<IApiPostResponse<{ token: string }>> {
    return this.post('/auth/login', { email, password })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async logout(): Promise<void> {
    return this.post('/auth/logout')
      .then(() => {})
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async signup(authData: SignUp): Promise<IApiPostResponse<{ token: string }>> {
    return this.post('/auth/signup', authData)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async validateToken(): Promise<IApiPostResponse<{ valid: boolean }>> {
    return this.get('/auth/validate')
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}

export const authService = new AuthService();
