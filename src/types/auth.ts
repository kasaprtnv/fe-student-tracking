export interface SignUp {
  email: string;
  password: string;
  phone: string;
  displayName: string;
  role: 'student' | 'admin' | 'coordinator';
}
