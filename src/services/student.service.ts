import { Student } from '@/types/student';
import { SelectOption } from '@/types/index';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class StudentService {
  private async request<T>(
    endpoint: string,
    options?: RequestInit,
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  async getAll(): Promise<Student[]> {
    return this.request<Student[]>('/students');
  }

  async getById(id: string): Promise<Student> {
    return this.request<Student>(`/students/${id}`);
  }

  async getOptions(): Promise<SelectOption[]> {
    return this.request<SelectOption[]>('/students/options');
  }

  async create(data: Omit<Student, 'id'>): Promise<Student> {
    return this.request<Student>('/students', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: Partial<Student>): Promise<Partial<Student>> {
    return this.request<Partial<Student>>(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<void> {
    return this.request<void>(`/students/${id}`, {
      method: 'DELETE',
    });
  }

  async deleteMultiple(ids: string[]): Promise<void> {
    return this.request<void>('/students/bulk-delete', {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    });
  }
}

export const studentService = new StudentService();
