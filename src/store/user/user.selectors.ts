import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/store';

// ============================
// Base Selectors
// ============================
export const selectUserState = (state: RootState) => state.users;

export const selectUserMap = (state: RootState) => state.users.userMap;

export const selectSearchQuery = (state: RootState) => state.users.searchQuery;

// ============================
// Memoized Selectors
// ============================
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
