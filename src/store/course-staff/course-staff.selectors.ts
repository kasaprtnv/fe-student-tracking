import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/store';

// ============================
// Base Selectors
// ============================
export const selectCourseStaffState = (state: RootState) => state.courseStaffs;

export const selectCourseStaffMap = (state: RootState) =>
  state.courseStaffs.courseStaffMap;

export const selectCourseStaffSearchQuery = (state: RootState) =>
  state.courseStaffs.searchQuery;

// ============================
// Memoized Selectors
// ============================
export const selectAllCourseStaffId = createSelector(
  [selectCourseStaffMap],
  (courseStaffMap) => {
    return Object.keys(courseStaffMap);
  },
);
