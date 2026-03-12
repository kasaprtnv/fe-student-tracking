import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/store';

// ============================
// Base Selectors
// ============================
export const selectTitleState = (state: RootState) => state.titles;

export const selectTitleMap = (state: RootState) => state.titles.titleMap;

export const selectSearchQuery = (state: RootState) => state.titles.searchQuery;

// ============================
// Memoized Selectors
// ============================
export const selectFilteredTitlesId = createSelector(
  [selectTitleMap, selectSearchQuery],
  (titleMap, searchQuery) => {
    const lowerSearchQuery = searchQuery.trim().toLowerCase();
    const titles = Object.values(titleMap);

    if (!lowerSearchQuery) {
      return titles.map((title) => title.id);
    }

    const filtered = titles
      .filter((title) => {
        const statusText = title.isInUse ? 'กำลังใช้งาน' : 'ยังไม่ถูกใช้งาน';

        return (
          title.name?.toLowerCase().includes(lowerSearchQuery) ||
          title.description?.toLowerCase().includes(lowerSearchQuery) ||
          statusText.toLowerCase().includes(lowerSearchQuery)
        );
      })
      .map((title) => title.id);

    return filtered;
  },
);

export const selectAllTitleId = createSelector([selectTitleMap], (titleMap) => {
  const sortedTitles = Object.values(titleMap).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  return sortedTitles.map((title) => title.id);
});
