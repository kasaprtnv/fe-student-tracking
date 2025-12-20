import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/store';

// ============================
// Base Selectors
// ============================
export const selectDashboardState = (state: RootState) => state.dashboard;

export const selectDashboardStats = (state: RootState) => state.dashboard.stats;

export const selectGraduationStats = (state: RootState) =>
  state.dashboard.graduationStats;

export const selectDashboardLoader = (state: RootState) =>
  state.dashboard.loader;

export const selectDashboardError = (state: RootState) => state.dashboard.error;

// ============================
// Memoized Selectors
// ============================
export const selectTotalTeachers = createSelector(
  [selectDashboardStats],
  (stats) => stats?.totalTeachers ?? 0,
);

export const selectGraduationStatsByYearRange = createSelector(
  [selectGraduationStats, (_state: RootState, yearRange: string) => yearRange],
  (graduationStats, yearRange) => {
    if (yearRange === 'all') return graduationStats;
    const currentYear = new Date().getFullYear() + 543; // พ.ศ.
    const yearsToShow = parseInt(yearRange);
    return graduationStats.filter((item) => {
      const year = parseInt(item.year);
      return year >= currentYear - yearsToShow + 1;
    });
  },
);
