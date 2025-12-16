import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarGroup } from '@/components/ui/avatar/avatar-group';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getAvatarFallbackName } from '@/lib/avatar-fallback-name';
// import { Switch } from '@/components/ui/switch';
import { formatDate } from '@/lib/format-date';
import { cn } from '@/lib/utils';
import { ICourse } from '@/types/course';
import { User } from '@/types/user';
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
      accessorKey: 'code',
      header: 'code',
    },
    {
      accessorKey: 'name',
      header: 'name',
    },
    {
      accessorKey: 'code',
      header: 'code',
    },
    {
      accessorKey: 'description',
      header: 'description',
      cell: (info) => {
        const description = info.getValue<string>();
        const isShowTooltip = description && description.length > 100;
        return (
          <Tooltip>
            <TooltipTrigger>
              <span className="max-w-[200px] truncate">
                {description || '-'}
              </span>
            </TooltipTrigger>
            {isShowTooltip && (
              <TooltipContent>
                <span>{description}</span>
              </TooltipContent>
            )}
          </Tooltip>
        );
      },
    },
    {
      accessorKey: 'users',
      header: 'staff',
      cell: (info) => {
        const users = info.getValue<User[] | undefined>();
        return (
          <div className="flex items-center gap-2">
            {users && users.length > 0 ? (
              <AvatarGroup max={3} className="align-start">
                {users.map((user) => (
                  <Avatar
                    key={user.id}
                    className="-ml-2 cursor-pointer first:ml-0"
                    title={`${user.firstName} ${user.lastName || ''}`}
                  >
                    <AvatarImage
                      src={'https://github.com/shadcn.png'}
                      alt={user.firstName}
                    />
                    <AvatarFallback className="bg-indigo-500 text-white">
                      {getAvatarFallbackName(
                        user.firstName,
                        user.lastName || '',
                      )}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </AvatarGroup>
            ) : (
              <span className="text-left">-</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'degree',
      header: 'degree',
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
