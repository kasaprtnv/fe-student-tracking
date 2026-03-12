import { SortingFn } from '@tanstack/react-table';

const isNumber = (text: string) => /^[0-9]/.test(text);
const isEnglish = (text: string) => /^[A-Za-z]/.test(text);
const isThai = (text: string) => /^[ก-ฮ]/.test(text);

const getPriority = (text: string) => {
  if (isNumber(text)) return 0; // 0-9
  if (isEnglish(text)) return 1; // A-Z
  if (isThai(text)) return 2; // ก-ฮ
  return 3;
};

export const mixedThEnTextSort = <T>(): SortingFn<T> => {
  return (rowA, rowB, columnId) => {
    const a = String(rowA.getValue(columnId) ?? '').trim();
    const b = String(rowB.getValue(columnId) ?? '').trim();

    if (!a && !b) return 0;
    if (!a) return 1;
    if (!b) return -1;

    const priorityA = getPriority(a);
    const priorityB = getPriority(b);

    // เรียงตามประเภทก่อน
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // ถ้าประเภทเดียวกัน ใช้ localeCompare
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
