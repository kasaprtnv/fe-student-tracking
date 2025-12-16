import { courseStaffService } from '@/services/course-staff.service';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { ICourseStaff, ICourseStaffCreateDTO } from '@/types/course-staff';

export const fetchCourseStaff = createAsyncThunk(
  'courseStaff/getList',
  async (_, { rejectWithValue }) => {
    try {
      const res = await courseStaffService.getAllCourseStaff();
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to fetch course staff');
    }
  },
);

export const fetchCourseStaffById = createAsyncThunk(
  'courseStaff/getById',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await courseStaffService.getCourseStaffById(id);
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to fetch course staff');
    }
  },
);

export const fetchCourseStaffByCourseId = createAsyncThunk(
  'courseStaff/getByCourseId',
  async (courseId: string, { rejectWithValue }) => {
    try {
      const res = await courseStaffService.getCourseStaffByCourseId(courseId);
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to fetch course staff by course ID');
    }
  },
);

export const fetchCourseStaffByUserId = createAsyncThunk(
  'courseStaff/getByUserId',
  async (userId: string, { rejectWithValue }) => {
    try {
      const res = await courseStaffService.getCourseStaffByUserId(userId);
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to fetch course staff by user ID');
    }
  },
);

export const createCourseStaff = createAsyncThunk(
  'courseStaff/create',
  async (payload: ICourseStaffCreateDTO, { rejectWithValue }) => {
    try {
      const res = await courseStaffService.createCourseStaff(payload);
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to create course staff');
    }
  },
);

export const updateCourseStaff = createAsyncThunk(
  'courseStaff/update',
  async (
    { id, data }: { id: string; data: Partial<ICourseStaff> },
    { rejectWithValue },
  ) => {
    try {
      const res = await courseStaffService.updateCourseStaff(id, data);
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to update course staff');
    }
  },
);

export const deleteCourseStaff = createAsyncThunk(
  'courseStaff/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await courseStaffService.deleteCourseStaff(id);
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to delete course staff');
    }
  },
);
