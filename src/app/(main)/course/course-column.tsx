import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { formatDate } from '@/lib/format-date';
import { ICourse } from '@/types/course';
import { ColumnDef } from '@tanstack/react-table';
import { Ellipsis, Pencil, Trash2 } from 'lucide-react';

interface ColumnActions {
  onEdit?: (data: ICourse) => void;
  onDelete?: (id: string) => void;
  onActiveChange?: (id: string, isActive: boolean) => void;
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
      accessorKey: 'isActive',
      header: 'is_active',
      size: 110,
      cell: ({ row, table }) => {
        const record = row.original;
        const { onActiveChange } = table.options.meta as ColumnActions;

        return (
          <div className="flex w-[110px] items-center justify-center">
            {onActiveChange ? (
              <Switch
                checked={record.isActive}
                onCheckedChange={(value) => {
                  onActiveChange(record.id, value);
                }}
              />
            ) : (
              <Badge variant={record.isActive ? 'destructive' : 'default'}>
                {record.isActive ? 'Yes' : 'No'}
              </Badge>
            )}
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
