import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/store';

// ============================
// Base Selectors
// ============================
export const selectMilestoneState = (state: RootState) => state.milestones;

export const selectMilestoneMap = (state: RootState) =>
  state.milestones.milestoneMap;

export const selectSearchQuery = (state: RootState) =>
  state.milestones.searchQuery;

export const selectPagination = (state: RootState) =>
  state.milestones.pagination;

export const selectPaginationPage = (state: RootState) =>
  state.milestones.pagination.page;

export const selectPaginationPageSize = (state: RootState) =>
  state.milestones.pagination.pageSize;

export const selectPaginationTotal = (state: RootState) =>
  state.milestones.pagination.total;

// ============================
// Memoized Selectors
// ============================

export const selectFilteredMilestoneIds = createSelector(
  [selectMilestoneMap, selectSearchQuery],
  (milestonemap, searchQuery) => {
    const lowerSearchQuery = searchQuery.trim().toLowerCase();
    const milestones = Object.values(milestonemap);
    if (!lowerSearchQuery) {
      return milestones.map((milestone) => milestone.id);
    }
    const filtered = milestones.filter(
      (milestone) =>
        milestone.name?.toLowerCase().includes(lowerSearchQuery) ||
        milestone.description?.toLowerCase().includes(lowerSearchQuery),
    );
    return filtered.map((milestone) => milestone.id);
  },
);

export const selectAllMilestoneIds = createSelector(
  [selectMilestoneMap],
  (milestoneMap) => {
    return Object.keys(milestoneMap);
  },
);

export const selectAllMilestonesFromMap = createSelector(
  [selectMilestoneMap],
  (milestoneMap) => {
    const sortedMilestones = Object.values(milestoneMap).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    return sortedMilestones;
  },
);
