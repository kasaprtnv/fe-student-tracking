'use client';

import { createSlice } from '@reduxjs/toolkit';
import {
  fetchDashboardStats,
  fetchGraduationStatsByYear,
} from './dashboard.thunks';
import { DashboardState } from '@/types/dashboard';

const initialState: DashboardState = {
  stats: null,
  graduationStats: [],
  loader: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearGraduationStats: (state) => {
      state.graduationStats = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch dashboard stats
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loader = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loader = false;
        state.stats = action.payload.data;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loader = false;
        state.error = action.payload as string;
      });

    // Fetch graduation stats by year
    builder
      .addCase(fetchGraduationStatsByYear.pending, (state) => {
        state.loader = true;
        state.error = null;
      })
      .addCase(fetchGraduationStatsByYear.fulfilled, (state, action) => {
        state.loader = false;
        state.graduationStats = action.payload.data;
      })
      .addCase(fetchGraduationStatsByYear.rejected, (state, action) => {
        state.loader = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearGraduationStats } = dashboardSlice.actions;
export default dashboardSlice.reducer;
