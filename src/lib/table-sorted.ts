import { SortingFn } from '@tanstack/react-table';

const isEnglish = (text: string) => /^[A-Za-z]/.test(text);
const isThai = (text: string) => /^[ก-ฮ]/.test(text);

export const mixedThEnTextSort = <T>(): SortingFn<T> => {
  return (rowA, rowB, columnId) => {
    const a = String(rowA.getValue(columnId) ?? '').trim();
    const b = String(rowB.getValue(columnId) ?? '').trim();

    if (!a && !b) return 0;
    if (!a) return 1;
    if (!b) return -1;

    const aIsEn = isEnglish(a);
    const bIsEn = isEnglish(b);
    const aIsTh = isThai(a);
    const bIsTh = isThai(b);

    // อังกฤษขึ้นก่อน
    if (aIsEn && bIsTh) return -1;
    if (aIsTh && bIsEn) return 1;

    return a.localeCompare(b, 'th', {
      sensitivity: 'base',
      numeric: true,
    });
  };
};

export const numericStringSort =
  <T>(): SortingFn<T> =>
  (rowA, rowB, columnId) => {
    const a = Number(rowA.getValue(columnId));
    const b = Number(rowB.getValue(columnId));
    return (a || 0) - (b || 0);
  };
