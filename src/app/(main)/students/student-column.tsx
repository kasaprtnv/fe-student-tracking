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
      accessorFn: (row) => {
        const titleName = `${row.title || ''}${row.firstName || ''}`.trim();
        const lastName = row.lastName || '';
        return `${titleName} ${lastName}`.trim() || '-';
      },
      cell: ({ row }) => {
        const titleName =
          `${row.original.title || ''}${row.original.firstName || ''}`.trim();
        const lastName = row.original.lastName || '';
        const fullName = `${titleName} ${lastName}`.trim();
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
