import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/store';

// ============================
// Base Selectors
// ============================
export const selectCourseState = (state: RootState) => state.courses;

export const selectCourseMap = (state: RootState) => state.courses.courseMap;

export const selectSearchQuery = (state: RootState) =>
  state.courses.searchQuery;

// ============================
// Memoized Selectors
// ============================
export const selectFilteredCoursesId = createSelector(
  [selectCourseMap, selectSearchQuery],
  (courseMap, searchQuery) => {
    const lowerSearchQuery = searchQuery.trim().toLowerCase();
    const courses = Object.values(courseMap);

    if (!lowerSearchQuery) {
      return courses.map((course) => course.id);
    }

    const filtered = courses
      .filter(
        (course) =>
          course.name?.toLowerCase().includes(lowerSearchQuery) ||
          course.description?.toLowerCase().includes(lowerSearchQuery),
      )
      .map((course) => course.id);
    return filtered;
  },
);

export const selectAllCourseId = createSelector(
  [selectCourseMap],
  (courseMap) => {
    const sortedCourses = Object.values(courseMap).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    return sortedCourses.map((course) => course.id);
  },
);
