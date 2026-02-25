import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/store';

// ============================
// Base Selectors
// ============================
export const selectUserState = (state: RootState) => state.users;

export const selectUserMap = (state: RootState) => state.users.userMap;

export const selectPaginatedUserMap = (state: RootState) =>
  state.users.paginatedUserMap;

export const selectPaginatedStudentMap = (state: RootState) =>
  state.users.paginatedStudentMap;

export const selectPaginatedTeacherMap = (state: RootState) =>
  state.users.paginatedTeacherMap;

export const selectSearchQuery = (state: RootState) => state.users.searchQuery;

export const selectPagination = (state: RootState) => state.users.pagination;

export const selectStudentPagination = (state: RootState) =>
  state.users.studentPagination;

export const selectTeacherPagination = (state: RootState) =>
  state.users.teacherPagination;

export const selectPaginationPage = (state: RootState) =>
  state.courses.pagination.page;

export const selectPaginationPageSize = (state: RootState) =>
  state.courses.pagination.pageSize;

export const selectPaginationTotal = (state: RootState) =>
  state.courses.pagination.total;

// ============================
// Memoized Selectors
// ============================

export const selectAllUsersFromMap = createSelector(
  [selectUserMap],
  (userMap) => {
    return Object.values(userMap).sort((a, b) =>
      a.firstName.localeCompare(b.firstName),
    );
  },
);

export const selectPaginatedUsersFromMap = createSelector(
  [selectPaginatedUserMap],
  (paginatedUserMap) => {
    return Object.values(paginatedUserMap).sort((a, b) =>
      a.firstName.localeCompare(b.firstName),
    );
  },
);

export const selectPaginatedStudentsFromMap = createSelector(
  [selectPaginatedStudentMap],
  (paginatedStudentMap) => {
    return Object.values(paginatedStudentMap).sort((a, b) =>
      a.firstName.localeCompare(b.firstName),
    );
  },
);

export const selectPaginatedTeachersFromMap = createSelector(
  [selectPaginatedTeacherMap],
  (paginatedTeacherMap) => {
    return Object.values(paginatedTeacherMap).sort((a, b) =>
      a.firstName.localeCompare(b.firstName),
    );
  },
);

export const selectFilteredUserIds = createSelector(
  [selectUserMap, selectSearchQuery],
  (userMap, searchQuery) => {
    const users = Object.values(userMap);
    const query = searchQuery.trim().toLowerCase();

    if (!query) return users.map((u) => u.id);

    const filteredUsers = users.filter((user) => {
      return (
        user.firstName?.toLowerCase().includes(query) ||
        user.lastName?.toLowerCase().includes(query) ||
        user.code?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.phone?.toLowerCase().includes(query)
      );
    });

    return filteredUsers.map((u) => u.id);
  },
);

export const selectAllUserIds = createSelector([selectUserMap], (userMap) =>
  Object.keys(userMap),
);

export const selectStudentUsers = createSelector([selectUserMap], (userMap) => {
  return Object.values(userMap).filter((user) => user.role === 'student');
});

export const selectTeacherUsers = createSelector([selectUserMap], (userMap) => {
  return Object.values(userMap).filter((user) => user.role === 'teacher');
});
