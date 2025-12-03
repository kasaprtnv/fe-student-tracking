import { formatDate } from '@/lib/format-date';
import { User } from '@/types/user';
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

interface ColumnActions {
  onEdit?: (data: User) => void;
  onDelete?: (id: string) => void;
  onActiveChange?: (id: string, isActive: boolean) => void;
  onLink?: (id: string) => void;
  t?: (key: string) => string;
}

export const createAllStudentColumns = (): ColumnDef<User>[] => {
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'code',
      header: 'code',
      cell: ({ row }) => row.original.code || '-',
    },
    {
      header: 'full-name',
      accessorFn: (row) =>
        `${row.firstName || ''} ${row.lastName || ''}`.trim() || '-',
    },
    {
      header: 'email',
      accessorKey: 'email',
      cell: ({ row }) => row.original.email || '-',
    },
    {
      header: 'phone',
      accessorKey: 'phone',
      cell: ({ row }) => row.original.phone || '-',
    },
    {
      header: 'education-level',
      accessorKey: 'degree',
      cell: ({ row }) => row.original.degree || '-',
    },
    {
      header: 'year',
      accessorKey: 'year',
      cell: ({ row }) => row.original.year || '-',
    },
    {
      header: 'course-name',
      accessorKey: 'courseName',
      cell: ({ row }) => row.original.courseName || '-',
    },
    {
      id: 'enrollDate',
      header: 'enroll-date',
      accessorKey: 'enrollDate',
      cell: (row) => {
        const rawDate = row.getValue<string>();
        const localString = formatDate(rawDate);
        return <span>{localString}</span>;
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
                <DropdownMenuItem onSelect={() => onEdit(record)}>
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
