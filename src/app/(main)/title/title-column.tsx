import { formatThaiDate } from '@/lib/format-date';
import { ITitle } from '@/types/title';
import { ColumnDef } from '@tanstack/react-table';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Ellipsis, Pencil, Trash2, NotebookPen } from 'lucide-react';
import { mixedThEnTextSort } from '@/lib/table-sorted';

type ColumnActions = {
  onEdit?: (record: ITitle) => void;
  onDelete?: (id: string) => void;
  onLink?: (id: string) => void;
  t?: (key: string) => string;
};

export const createTitleColumns = (): ColumnDef<ITitle>[] => {
  const columns: ColumnDef<ITitle>[] = [
    {
      accessorKey: 'name',
      header: 'name',
      sortingFn: mixedThEnTextSort<ITitle>(),
    },
    {
      accessorKey: 'description',
      header: 'description',
      sortingFn: mixedThEnTextSort<ITitle>(),
    },
    {
      accessorKey: 'createdAt',
      header: 'created_at',
      sortingFn: 'datetime',
      cell: (info) => {
        const rawDate = info.getValue<string>();
        const localString = formatThaiDate(rawDate);
        return <span>{localString}</span>;
      },
    },
    {
      accessorKey: 'updatedAt',
      header: 'updated_at',
      sortingFn: 'datetime',
      cell: (info) => {
        const rawDate = info.getValue<string>();
        const localString = formatThaiDate(rawDate);
        return <span>{localString}</span>;
      },
    },
  ];

  // เพิ่มคอลัมน์ actions
  columns.push({
    id: 'actions',
    size: 40,
    cell: ({ row, table }) => {
      const record = row.original;
      const { onEdit, onDelete, t, onLink } = table.options
        .meta as ColumnActions;

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

            {onLink && (
              <DropdownMenuItem onSelect={() => onLink(record.id)}>
                <div className="flex items-center gap-2">
                  <NotebookPen size={14} />
                  {t?.('select-milestone')}
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
