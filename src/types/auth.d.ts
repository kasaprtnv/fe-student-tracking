import { User } from './user.dใts';

export interface SignUp {
  email: string;
  password: string;
  phone: string;
  displayName: string;
  role: 'student' | 'admin' | 'coordinator';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}
