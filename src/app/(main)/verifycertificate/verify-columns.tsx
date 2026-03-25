'use client';

import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { IStudentStepProgress } from '@/types/student-step-progress';
import { ColumnDef } from '@tanstack/react-table';
import { mixedThEnTextSort } from '@/lib/table-sorted';
import { formatShortDate } from '@/lib/format-date';

type TranslationFunction = (key: string) => string;

export function createVerifyColumns(
  t: TranslationFunction,
  onView: (id: string) => void,
  locale: string = 'th',
): ColumnDef<IStudentStepProgress>[] {
  return [
    {
      accessorKey: 'studentCode',
      header: t('table.student_code'),
      sortingFn: 'basic',
      cell: ({ row }) =>
        row.original.studentCode || row.original.student?.code || '-',
    },
    {
      accessorKey: 'studentName',
      header: t('table.name'),
      sortingFn: mixedThEnTextSort<IStudentStepProgress>(),
      cell: ({ row }) =>
        row.original.studentName ||
        `${row.original.student?.firstName || ''} ${row.original.student?.lastName || ''}`.trim() ||
        '-',
    },
    {
      accessorKey: 'courseName',
      header: t('table.course'),
      sortingFn: mixedThEnTextSort<IStudentStepProgress>(),
      cell: ({ row }) =>
        row.original.courseName || row.original.student?.courseName || '-',
    },
    {
      accessorKey: 'stepName',
      header: t('detail.step'),
      sortingFn: mixedThEnTextSort<IStudentStepProgress>(),
      cell: ({ row }) =>
        row.original.stepName || row.original.step?.name || '-',
    },
    {
      accessorKey: 'submittedAt',
      header: t('detail.submit_date'),
      sortingFn: 'datetime',
      cell: (row) => {
        const rawDate = row.getValue<string>();
        if (!rawDate) return <span>-</span>;
        const localString = formatShortDate(rawDate, locale);
        return localString;
      },
    },
    {
      id: 'actions',
      header: t('table.action'),
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onView(row.original.id)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
      enableSorting: false,
      enableColumnFilter: false,
    },
  ];
}
