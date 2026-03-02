'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { IStudentStepProgress } from '@/types/student-step-progress';
import { ColumnDef } from '@tanstack/react-table';
import { mixedThEnTextSort } from '@/lib/table-sorted';

type TranslationFunction = (key: string) => string;

const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const getStatusBadge = (status: string, t: TranslationFunction) => {
  switch (status) {
    case 'pending approval':
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          {t('status.pending')}
        </Badge>
      );
    case 'approved':
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          {t('status.approved')}
        </Badge>
      );
    case 'declined':
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-800">
          {t('status.declined')}
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export function createVerifyColumns(
  t: TranslationFunction,
  onView: (id: string) => void,
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
      cell: ({ row }) => formatDate(row.original.submittedAt),
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
