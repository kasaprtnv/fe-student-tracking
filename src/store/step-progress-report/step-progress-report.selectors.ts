import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/store';

// ============================
// Base Selectors
// ============================
export const selectStepProgressReportState = (state: RootState) =>
  state.stepProgressReports;

export const selectStepProgressReportMap = (state: RootState) =>
  state.stepProgressReports.stepProgressReportMap;

export const selectStepProgressReportSearchQuery = (state: RootState) =>
  state.stepProgressReports.searchQuery;

// ============================
// Memoized Selectors
// ============================
export const selectFilteredStepProgressReportIds = createSelector(
  [selectStepProgressReportMap, selectStepProgressReportSearchQuery],
  (stepProgressReportMap, searchQuery) => {
    const lowerSearchQuery = searchQuery.trim().toLowerCase();
    const stepProgressReports = Object.values(stepProgressReportMap);
    if (!lowerSearchQuery) {
      return stepProgressReports.map(
        (stepProgressReport) => stepProgressReport.progressId,
      );
    }

    const filtered = stepProgressReports
      .filter(
        (stepProgressReport) =>
          stepProgressReport.studentFirstName
            ?.toLowerCase()
            .includes(lowerSearchQuery) ||
          stepProgressReport.studentLastName
            ?.toLowerCase()
            .includes(lowerSearchQuery) ||
          stepProgressReport.studentCode
            ?.toLowerCase()
            .includes(lowerSearchQuery),
      )
      .map((report) => report.progressId);
    return filtered;
  },
);

export const selectAllStepProgressReportIds = createSelector(
  [selectStepProgressReportMap],
  (stepProgressReportMap) => {
    const sortedStepProgressReports = Object.values(stepProgressReportMap).sort(
      (a, b) => a.studentCode.localeCompare(b.studentCode),
    );
    return sortedStepProgressReports.map(
      (stepProgressReport) => stepProgressReport.progressId,
    );
  },
);
