'use client';
import { formatShortDate } from '@/lib/format-date';
import { formatPhoneNumber } from '@/lib/format-phone';
import { User } from '@/types/user';
import { ITitle } from '@/types/title';
import { ColumnDef } from '@tanstack/react-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Ellipsis, Pencil, Trash2 } from 'lucide-react';
import {
  mixedThEnTextSort,
  numericStringSort,
} from '../../../lib/table-sorted';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ColumnActions {
  onEdit?: (data: User) => void;
  onDelete?: (id: string) => void;
  onActiveChange?: (id: string, isActive: boolean) => void;
  onLink?: (id: string) => void;
  t?: (key: string) => string;
}

// Student-only columns (without role column)
export const createStudentColumns = (
  t: (key: string) => string,
  tDegree: (key: string) => string,
  tUser: (key: string) => string,
  titleMap: Record<string, ITitle>,
  locale: string = 'th',
): ColumnDef<User>[] => {
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'code',
      header: t('student-code'),
      sortingFn: 'basic',
      cell: ({ row }) => row.original.code || '-',
    },
    {
      header: t('full-name'),
      sortingFn: mixedThEnTextSort<User>(),
      accessorFn: (row) => {
        const titleName = row.titleId ? titleMap[row.titleId]?.name || '' : '';
        const firstName = row.firstName || '';
        const lastName = row.lastName || '';
        const fullName = `${titleName}${firstName} ${lastName}`.trim();
        return fullName || '-';
      },
    },
    {
      header: t('email'),
      accessorKey: 'email',
      sortingFn: 'alphanumeric',
      cell: ({ row }) => row.original.email || '-',
    },
    {
      header: t('phone'),
      accessorKey: 'phone',
      sortingFn: (rowA, rowB, columnId) => {
        const a = String(rowA.getValue(columnId) ?? '').replace(/\D/g, '');
        const b = String(rowB.getValue(columnId) ?? '').replace(/\D/g, '');
        return a.localeCompare(b);
      },
      cell: ({ row }) => formatPhoneNumber(row.original.phone),
    },
    {
      header: t('education-level'),
      accessorKey: 'degree',
      cell: ({ row }) => {
        const degree = row.original.degree;
        if (!degree) return '-';
        const degreeMap: Record<string, string> = {
          bachelor: tDegree('bachelor'),
          master: tDegree('master'),
          doctorate: tDegree('doctorate'),
        };
        return degreeMap[degree] || degree;
      },
    },
    {
      header: t('major'),
      accessorKey: 'major',
      sortingFn: mixedThEnTextSort<User>(),
      cell: ({ row }) => {
        const value = row.original.major || '-';
        return (
          <span className="block max-w-[200px] truncate" title={value}>
            {value}
          </span>
        );
      },
    },
    {
      header: t('year'),
      accessorKey: 'year',
      sortingFn: numericStringSort<User>(),
      cell: ({ row }) => row.original.year || '-',
    },
    {
      header: t('enrolled-course-name'),
      accessorKey: 'courseName',
      sortingFn: mixedThEnTextSort<User>(),
      cell: ({ row }) => {
        const value = row.original.courseName || '-';
        return (
          <span className="block max-w-[280px] truncate" title={value}>
            {value}
          </span>
        );
      },
    },
    {
      header: t('study-plan'),
      accessorKey: 'studyPlan',
      cell: ({ row }) => row.original.studyPlan || '-',
    },
    {
      id: 'enrollDate',
      header: t('enroll-date'),
      accessorKey: 'enrollDate',
      sortingFn: 'datetime',
      cell: (row) => {
        const rawDate = row.getValue<string>();
        if (!rawDate) return <span>-</span>;
        const localString = formatShortDate(rawDate, locale);
        return localString;
      },
    },
    {
      id: 'graduated',
      header: t('graduated'),
      accessorKey: 'graduated',
      sortingFn: 'basic',
      cell: ({ row }) => {
        const graduated = row.original.graduated;
        return graduated ? t('graduated-yes') : t('graduated-no');
      },
    },
    {
      header: t('status'),
      accessorKey: 'isActive',
      cell: ({ row }) => {
        const record = row.original;

        return (
          <div className="flex w-[110px] items-center justify-center">
            <Badge
              className={cn(
                'px-2 py-0.5 text-xs',
                record.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800',
              )}
            >
              {record.isActive ? tUser?.('active') : tUser?.('inactive')}
            </Badge>
          </div>
        );
      },
    },
  ];
  columns.push({
    id: 'actions',
    size: 40,
    cell: ({ row, table }) => {
      const record = row.original;
      const { onEdit, onDelete, t } = table.options.meta as ColumnActions;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label="Open menu"
              variant="ghost"
              className="data-[state=open]:bg-muted flex size-8 p-0"
            >
              <Ellipsis className="size-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {onEdit && (
              <>
                <DropdownMenuItem
                  onSelect={() => onEdit(record)}
                  disabled={record.role === 'admin'}
                >
                  <div className="flex items-center gap-2">
                    <Pencil size={14} />
                    {t?.('edit')}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}

            {onDelete && (
              <DropdownMenuItem onSelect={() => onDelete(record.id)}>
                <div className="flex items-center gap-2">
                  <Trash2 size={14} color="#e7000b" />
                  {t?.('delete')}
                </div>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  });

  return columns;
};
