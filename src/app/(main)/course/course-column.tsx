import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
// import { Switch } from '@/components/ui/switch';
import { formatDate } from '@/lib/format-date';
import { cn } from '@/lib/utils';
import { ICourse } from '@/types/course';
import { ColumnDef } from '@tanstack/react-table';
import { Ellipsis, Pencil, Trash2, NotebookPen } from 'lucide-react';

interface ColumnActions {
  onEdit?: (data: ICourse) => void;
  onDelete?: (id: string) => void;
  onActiveChange?: (id: string, isActive: boolean) => void;
  onLink?: (id: string) => void;
  t?: (key: string) => string;
}

export const createCourseColumns = (): ColumnDef<ICourse>[] => {
  const columns: ColumnDef<ICourse>[] = [
    {
      accessorKey: 'name',
      header: 'name',
    },
    {
      accessorKey: 'description',
      header: 'description',
    },
    {
      accessorKey: 'createdAt',
      header: 'created_at',
      cell: (info) => {
        const rawDate = info.getValue<string>();
        const localString = formatDate(rawDate);
        return <span>{localString}</span>;
      },
    },
    {
      accessorKey: 'updatedAt',
      header: 'updated_at',
      cell: (info) => {
        const rawDate = info.getValue<string>();
        const localString = formatDate(rawDate);
        return <span>{localString}</span>;
      },
    },
    {
      accessorKey: 'isUsed',
      header: 'is_used',
      size: 110,
      cell: ({ row }) => {
        const record = row.original;

        return (
          <div className="flex w-[110px] items-center justify-center">
            <Badge
              className={cn(
                'px-2 py-0.5 text-xs',
                record.isUsed
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800',
              )}
            >
              {record.isUsed ? 'Yes' : 'No'}
            </Badge>
          </div>
        );
      },
      // filterFn: (row, columnId, filterValues) => {
      //   if (!filterValues.length) return true; // No filter applied, show all
      //   return filterValues.includes(row.getValue(columnId)); // Match any selected value
      // },
    },
  ];
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
