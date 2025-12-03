import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/store';

export const selectMilestonePrerequisiteState = (state: RootState) =>
  state.milestonePrerequisites;

// ⭐ เพิ่มให้ตรงกับที่ต้องการ
export const selectPrerequisiteMap = (state: RootState) =>
  state.milestonePrerequisites.prerequisiteMap;

export const selectSearchQuery = (state: RootState) =>
  state.milestonePrerequisites.searchQuery;

export const selectFilteredPrerequisiteIds = createSelector(
  [selectPrerequisiteMap, selectSearchQuery],
  (prerequisiteMap, searchQuery) => {
    const lower = searchQuery.trim().toLowerCase();
    const items = Object.values(prerequisiteMap);

    if (!lower) return items.map((p) => p.id);

    return items
      .filter((p) => {
        return (
          p.targetMilestoneId?.toLowerCase().includes(lower) ||
          p.targetStepId?.toLowerCase().includes(lower) ||
          p.requiredMilestoneId?.toLowerCase().includes(lower) ||
          p.requiredStepId?.toLowerCase().includes(lower)
        );
      })
      .map((p) => p.id);
  },
);

export const selectAllPrerequisiteIds = createSelector(
  [selectPrerequisiteMap],
  (prerequisiteMap) => {
    const sorted = Object.values(prerequisiteMap).sort((a, b) =>
      a.id.localeCompare(b.id),
    );
    return sorted.map((p) => p.id);
  },
);
