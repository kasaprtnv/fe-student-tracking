import { courseService } from '@/services/course.service';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { ICourse, ICourseCreateDTO } from '@/types/course';

export const fetchCourses = createAsyncThunk(
  'course/getList',
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
      const res = await courseService.getAllCourses(
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
      return rejectWithValue('Failed to fetch courses');
    }
  },
);

export const searchCourses = createAsyncThunk(
  'course/search',
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
      const res = await courseService.searchCourses(
        searchQuery,
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
      return rejectWithValue('Failed to search courses');
    }
  },
);

export const fetchCourseById = createAsyncThunk(
  'course/getById',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await courseService.getCourseById(id);
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to fetch course');
    }
  },
);

export const createCourse = createAsyncThunk(
  'course/create',
  async (payload: ICourseCreateDTO, { rejectWithValue }) => {
    try {
      const res = await courseService.createCourse(payload);
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to create course');
    }
  },
);

export const createCourseWithStaff = createAsyncThunk(
  'course/createWithStaff',
  async (payload: ICourseCreateDTO, { rejectWithValue }) => {
    try {
      const res = await courseService.createCourseWithStaff(payload);
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to create course with staff');
    }
  },
);

export const updateCourse = createAsyncThunk(
  'course/update',
  async (
    { id, data }: { id: string; data: Partial<ICourse> },
    { rejectWithValue },
  ) => {
    try {
      const res = await courseService.updateCourse(id, data);
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to update course');
    }
  },
);

export const deleteCourse = createAsyncThunk(
  'course/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await courseService.deleteCourse(id);
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to delete course');
    }
  },
);

export const deleteCourses = createAsyncThunk(
  'course/deleteMultiple',
  async (ids: string[], { rejectWithValue }) => {
    try {
      const res = await courseService.deleteMultipleCourses(ids);
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to delete multiple courses');
    }
  },
);
