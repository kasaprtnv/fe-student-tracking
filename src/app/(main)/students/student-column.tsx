import { formatDate } from '@/lib/format-date';
import { User } from '@/types/user';
import { ColumnDef } from '@tanstack/react-table';

export const createStudentColumns = (
  t: (key: string) => string,
): ColumnDef<User>[] => {
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'code',
      header: t('code'),
      cell: ({ row }) => {
        const code = row.original.code;
        return <span>{code || '-'}</span>;
      },
    },
    {
      header: t('full-name'),
      accessorFn: (row) =>
        `${row.firstName || ''} ${row.lastName || ''}`.trim() || '-',
      cell: ({ row }) => {
        const fullName =
          `${row.original.firstName || ''} ${row.original.lastName || ''}`.trim();
        return <span>{fullName || '-'}</span>;
      },
    },
    {
      header: t('email'),
      accessorKey: 'email',
      cell: ({ row }) => row.original.email || '-',
    },
    {
      header: t('phone'),
      accessorKey: 'phone',
      cell: ({ row }) => row.original.phone || '-',
    },
    {
      header: t('education-level'),
      accessorKey: 'degree',
      cell: ({ row }) => row.original.degree || '-',
    },
    {
      header: t('year'),
      accessorKey: 'year',
      cell: ({ row }) => row.original.year || '-',
      filterFn: (row, id, value) => {
        const rowValue = row.getValue(id);
        return Array.isArray(value) && value.includes(String(rowValue));
      },
    },
    {
      header: t('course-name'),
      accessorKey: 'courseName',
      cell: ({ row }) => row.original.courseName || '-',
      filterFn: (row, id, value) => {
        const rowValue = row.getValue(id);
        return Array.isArray(value) && value.includes(rowValue);
      },
    },
    {
      id: 'academicYear',
      header: t('academic-year'),
      accessorFn: (row) => {
        if (!row.enrollDate) return '-';
        try {
          const date = new Date(row.enrollDate);
          if (isNaN(date.getTime())) return '-';
          return (date.getFullYear() + 543).toString();
        } catch {
          return '-';
        }
      },
      filterFn: (row, id, value) => {
        const rowValue = row.getValue(id);
        return Array.isArray(value) && value.includes(rowValue);
      },
    },
    {
      id: 'enrollDate',
      header: t('enroll-date'),
      accessorKey: 'enrollDate',
      cell: (row) => {
        const rawDate = row.getValue<string>();
        if (!rawDate) return <span>-</span>;
        const localString = formatDate(rawDate);
        return <span>{localString}</span>;
      },
    },
  ];

  return columns;
};
