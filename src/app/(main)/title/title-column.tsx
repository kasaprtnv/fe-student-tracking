import { formatThaiDate } from '@/lib/format-date';
import { ITitle } from '@/types/title';
import { ColumnDef } from '@tanstack/react-table';

export const createTitleColumns = (): ColumnDef<ITitle>[] => {
  const columns: ColumnDef<ITitle>[] = [
    {
      accessorKey: 'name',
      header: 'name',
    },
    {
      accessorKey: 'createdAt',
      header: 'created_at',
      cell: (info) => {
        const rawDate = info.getValue<string>();
        const localString = formatThaiDate(rawDate);
        return <span>{localString}</span>;
      },
    },
    {
      accessorKey: 'updatedAt',
      header: 'updated_at',
      cell: (info) => {
        const rawDate = info.getValue<string>();
        const localString = formatThaiDate(rawDate);
        return <span>{localString}</span>;
      },
    },
  ];

  return columns;
};
