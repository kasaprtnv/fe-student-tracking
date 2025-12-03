import { userService } from '@/services/user.service';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { User } from '@/types/user';

export const fetchUsers = createAsyncThunk(
  'users/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await userService.getAll();
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to fetch users');
    }
  },
);

export const fetchStudentUsers = createAsyncThunk(
  'users/fetchStudents',
  async (_, { rejectWithValue }) => {
    try {
      const res = await userService.getStudents();
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to fetch student users');
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

export const createUser = createAsyncThunk(
  'users/create',
  async (data: Partial<User>, { rejectWithValue }) => {
    try {
      const res = await userService.createUser(data);
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
      const res = await userService.updateUser(id, data);
      return res;
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
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to delete users');
    }
  },
);
