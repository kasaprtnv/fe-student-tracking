'use client';

import { dashboardService } from '@/services/dashboard.service';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/getStats',
  async (_, { rejectWithValue }) => {
    try {
      const res = await dashboardService.getDashboardStats();
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to fetch dashboard stats');
    }
  },
);

export const fetchGraduationStatsByYear = createAsyncThunk(
  'dashboard/getGraduationStats',
  async (
    { courseId, degree }: { courseId?: string; degree?: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await dashboardService.getGraduationStatsByYear(
        courseId,
        degree,
      );
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to fetch graduation stats');
    }
  },
);
