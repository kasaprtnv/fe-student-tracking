import { userService } from '@/services/user.service';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { User, StudentFilterPayload } from '@/types/user';

export const fetchUsers = createAsyncThunk(
  'users/fetchAll',
  async (
    {
      page,
      pageSize,
      sortBy,
      sortOrder,
    }: {
      page?: number;
      pageSize?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
    { rejectWithValue },
  ) => {
    try {
      const res = await userService.getAll(
        page,
        pageSize,
        undefined,
        sortBy,
        sortOrder,
      );
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to fetch users');
    }
  },
);

export const searchUsers = createAsyncThunk(
  'users/search',
  async (
    {
      searchQuery,
      page,
      pageSize,
      sortBy,
      sortOrder,
    }: {
      searchQuery: string;
      page: number;
      pageSize: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
    { rejectWithValue },
  ) => {
    try {
      const res = await userService.searchUsers(
        searchQuery,
        page,
        pageSize,
        undefined,
        sortBy,
        sortOrder,
      );
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to search users');
    }
  },
);

export const fetchStudentUsers = createAsyncThunk(
  'users/fetchStudents',
  async (
    {
      page,
      pageSize,
      sortBy,
      sortOrder,
    }: {
      page?: number;
      pageSize?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
    { rejectWithValue },
  ) => {
    try {
      const res = await userService.getAll(
        page,
        pageSize,
        'student',
        sortBy,
        sortOrder,
      );
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to fetch student users');
    }
  },
);

export const fetchTeacherUsers = createAsyncThunk(
  'users/fetchTeachers',
  async (
    {
      page,
      pageSize,
      sortBy,
      sortOrder,
    }: {
      page?: number;
      pageSize?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
    { rejectWithValue },
  ) => {
    try {
      const res = await userService.getAll(
        page,
        pageSize,
        'teacher',
        sortBy,
        sortOrder,
      );
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to fetch teacher users');
    }
  },
);

export const searchStudents = createAsyncThunk(
  'users/searchStudents',
  async (
    {
      searchQuery,
      page,
      pageSize,
      sortBy,
      sortOrder,
    }: {
      searchQuery: string;
      page: number;
      pageSize: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
    { rejectWithValue },
  ) => {
    try {
      const res = await userService.searchUsers(
        searchQuery,
        page,
        pageSize,
        'student',
        sortBy,
        sortOrder,
      );
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to search students');
    }
  },
);

export const searchTeachers = createAsyncThunk(
  'users/searchTeachers',
  async (
    {
      searchQuery,
      page,
      pageSize,
      sortBy,
      sortOrder,
    }: {
      searchQuery: string;
      page: number;
      pageSize: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
    { rejectWithValue },
  ) => {
    try {
      const res = await userService.searchUsers(
        searchQuery,
        page,
        pageSize,
        'teacher',
        sortBy,
        sortOrder,
      );
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to search teachers');
    }
  },
);

export const fetchUserById = createAsyncThunk(
  'users/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await userService.getById(id);
      return res.data;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to fetch user');
    }
  },
);

export const uploadUserProfileImage = createAsyncThunk(
  'users/uploadProfileImage',
  async ({ id, file }: { id: string; file: File }, { rejectWithValue }) => {
    try {
      const res = await userService.uploadProfile(id, file);
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to upload profile image');
    }
  },
);

export const createUser = createAsyncThunk(
  'users/create',
  async (data: Partial<User>, { rejectWithValue }) => {
    try {
      const res = await userService.createUser(data);

      // Check if backend returned success: false
      if (!res.success) {
        return rejectWithValue(res.message || 'Failed to create user');
      }

      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to create user');
    }
  },
);

export const updateUser = createAsyncThunk(
  'users/update',
  async (
    { id, data }: { id: string; data: Partial<User> },
    { rejectWithValue },
  ) => {
    try {
      const updateRes = await userService.updateUser(id, data);

      // Check if backend returned success: false
      if (!updateRes?.success) {
        return rejectWithValue(updateRes?.message || 'Failed to update user');
      }

      // Fetch the updated user to get fresh data
      const updatedUser = await userService.getById(id);
      return { id, user: updatedUser.data };
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to update user');
    }
  },
);

export const deleteUser = createAsyncThunk(
  'users/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await userService.deleteUser(id);

      // Check if backend returned success: false
      if (!res.success) {
        return rejectWithValue(res.message || 'Failed to delete user');
      }

      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to delete user');
    }
  },
);

export const deleteMultipleUsers = createAsyncThunk(
  'users/deleteMultiple',
  async (ids: string[], { rejectWithValue }) => {
    try {
      const res = await userService.deleteMultipleUsers(ids);

      // Check if backend returned success: false
      if (!res.success) {
        return rejectWithValue(res.message || 'Failed to delete users');
      }

      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to delete users');
    }
  },
);

export const filterStudentUsers = createAsyncThunk(
  'users/filterStudents',
  async (
    {
      filters,
      page,
      pageSize,
      sortBy,
      sortOrder,
    }: {
      filters: StudentFilterPayload;
      page?: number;
      pageSize?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
    { rejectWithValue },
  ) => {
    try {
      const res = await userService.filterStudents(
        filters,
        page,
        pageSize,
        sortBy,
        sortOrder,
      );
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to filter students');
    }
  },
);
