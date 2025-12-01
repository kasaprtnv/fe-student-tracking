import { ColumnDef } from '@tanstack/react-table';
import { IMilestone } from '@/types/milestone';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Ellipsis, Pencil, Trash2, NotebookPen } from 'lucide-react';
import { formatDate } from '@/lib/format-date';

interface ColumnActions {
  onEdit?: (data: IMilestone) => void;
  onDelete?: (id: string) => void;
  onActiveChange?: (id: string, isActive: boolean) => void;
  onLink?: (id: string) => void;
  t?: (key: string) => string;
}

export const createMilestoneColumns = (): ColumnDef<IMilestone>[] => {
  const columns: ColumnDef<IMilestone>[] = [
    {
      accessorKey: 'name',
      header: 'name',
    },
    {
      accessorKey: 'description',
      header: 'description',
    },
    {
      accessorKey: 'courseId',
      header: 'courseId',
    },
    {
      accessorKey: 'position',
      header: 'position',
    },
    {
      accessorKey: 'deadlineDate',
      header: 'deadlineDate',
      cell: ({ row }) => {
        const deadlineDate = row.original.deadlineDate;
        return formatDate(deadlineDate);
      },
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
                  {t?.('to-milestone-step')}
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
