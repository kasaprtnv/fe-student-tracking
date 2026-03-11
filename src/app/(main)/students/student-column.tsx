import { formatShortDate } from '@/lib/format-date';
import { formatPhoneNumber } from '@/lib/format-phone';
import { mixedThEnTextSort, numericStringSort } from '@/lib/table-sorted';
import { ITitle } from '@/types/title';
import { User } from '@/types/user';
import { ColumnDef } from '@tanstack/react-table';

export const createStudentColumns = (
  t: (key: string) => string,
  tDegree: (key: string) => string,
  titleMap: Record<string, ITitle>,
  onViewProfile?: (id: string) => void,
  locale: string = 'th',
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
              className="text-primary cursor-pointer p-0 leading-none font-medium hover:underline"
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
      accessorKey: 'fullNameWithTitle',
      sortingFn: mixedThEnTextSort<User>(),
      accessorFn: (row) => {
        if (row.fullNameWithTitle) return row.fullNameWithTitle;
        else {
          const titleName = row.titleId
            ? titleMap[row.titleId]?.name || ''
            : '';
          const firstName = row.firstName || '';
          const lastName = row.lastName || '';
          const fullName = `${titleName}${firstName} ${lastName}`.trim();
          return fullName || '-';
        }
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
      header: t('major'),
      accessorKey: 'major',
      sortingFn: mixedThEnTextSort<User>(),
      cell: ({ row }) => (
        <span className="block max-w-[200px] truncate">
          {row.original.major || '-'}
        </span>
      ),
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
      header: t('enrolled-course-name'),
      accessorKey: 'courseCodeWithName',
      sortingFn: mixedThEnTextSort<User>(),
      cell: ({ row }) => {
        const value = row.original.courseCodeWithName || '-';
        return (
          <span className="inline-block max-w-[350px] truncate" title={value}>
            {value}
          </span>
        );
      },
      filterFn: (row, id, value) => {
        const rowValue = row.getValue(id);
        return Array.isArray(value) && value.includes(rowValue);
      },
    },

    {
      id: 'studyPlan',
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
        if (!rawDate) return '-';
        return formatShortDate(rawDate, locale);
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
  ];

  return columns;
};
