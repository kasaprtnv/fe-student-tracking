import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/store';

// ============================
// Base Selectors
// ============================
export const selectMilestoneStepState = (state: RootState) =>
  state.milestoneSteps;

export const selectMilestoneStepMap = (state: RootState) =>
  state.milestoneSteps.milestoneStepMap;

export const selectSearchQuery = (state: RootState) =>
  state.milestoneSteps.searchQuery;

// ============================
// Memoized Selectors
// ============================
export const selectFilteredMilestoneStepIds = createSelector(
  [selectMilestoneStepMap, selectSearchQuery],
  (milestoneStepMap, searchQuery) => {
    const lowerSearchQuery = searchQuery.trim().toLowerCase();
    const milestoneSteps = Object.values(milestoneStepMap);

    if (!lowerSearchQuery) {
      return milestoneSteps.map((milestoneStep) => milestoneStep.id);
    }

    const filtered = milestoneSteps
      .filter(
        (milestoneStep) =>
          milestoneStep.name?.toLowerCase().includes(lowerSearchQuery) ||
          milestoneStep.description?.toLowerCase().includes(lowerSearchQuery),
      )
      .map((step) => step.id);
    return filtered;
  },
);

export const selectAllMilestoneStepIds = createSelector(
  [selectMilestoneStepMap],
  (milestoneStepMap) => {
    const sortedMilestoneSteps = Object.values(milestoneStepMap).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    return sortedMilestoneSteps.map((milestoneStep) => milestoneStep.id);
  },
);
