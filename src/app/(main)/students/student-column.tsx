import { formatThaiDate } from '@/lib/format-date';
import { formatPhoneNumber } from '@/lib/format-phone';
import { mixedThEnTextSort, numericStringSort } from '@/lib/table-sorted';
import { User } from '@/types/user';
import { ColumnDef } from '@tanstack/react-table';

export const createStudentColumns = (
  t: (key: string) => string,
  tDegree: (key: string) => string,
  onViewProfile?: (id: string) => void,
): ColumnDef<User>[] => {
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'code',
      header: t('student-code'),
      sortingFn: 'basic',
      cell: ({ row }) => {
        const code = row.original.code;
        const id = row.original.id;
        if (onViewProfile && id) {
          return (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewProfile(id);
              }}
              className="text-primary cursor-pointer font-medium hover:underline"
            >
              {code || '-'}
            </button>
          );
        }
        return <span>{code || '-'}</span>;
      },
    },
    {
      header: t('full-name'),
      sortingFn: mixedThEnTextSort<User>(),
      accessorFn: (row) => {
        const firstName = row.firstName || '';
        const lastName = row.lastName || '';
        return `${firstName} ${lastName}`.trim() || '-';
      },
      cell: ({ row }) => {
        const firstName = row.original.firstName || '';
        const lastName = row.original.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim();
        return <span>{fullName || '-'}</span>;
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
      header: t('year'),
      accessorKey: 'year',
      sortingFn: numericStringSort<User>(),
      cell: ({ row }) => row.original.year || '-',
      filterFn: (row, id, value) => {
        const rowValue = row.getValue(id);
        return Array.isArray(value) && value.includes(String(rowValue));
      },
    },
    {
      header: t('course-name'),
      accessorKey: 'courseName',
      sortingFn: mixedThEnTextSort<User>(),
      cell: ({ row }) => row.original.courseName || '-',
      filterFn: (row, id, value) => {
        const rowValue = row.getValue(id);
        return Array.isArray(value) && value.includes(rowValue);
      },
    },

    {
      id: 'studyPlan',
      header: t('study-plan'),
      accessorKey: 'studyPlan',
      cell: ({ row }) => <span>{row.original.studyPlan || '-'}</span>,
    },
    {
      id: 'enrollDate',
      header: t('enroll-date'),
      accessorKey: 'enrollDate',
      sortingFn: 'datetime',
      cell: (row) => {
        const rawDate = row.getValue<string>();
        if (!rawDate) return <span>-</span>;
        const localString = formatThaiDate(rawDate);
        return <span>{localString}</span>;
      },
    },
    {
      id: 'graduated',
      header: t('graduated'),
      accessorKey: 'graduated',
      sortingFn: 'basic',
      cell: ({ row }) => {
        const graduated = row.original.graduated;
        return (
          <span>{graduated ? t('graduated-yes') : t('graduated-no')}</span>
        );
      },
    },
  ];

  return columns;
};
