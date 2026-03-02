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
import { formatShortDate } from '@/lib/format-date';
import { mixedThEnTextSort } from '@/lib/table-sorted';
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

export const createCourseColumns = (
  tDegree: (key: string) => string,
  locale: string = 'th',
): ColumnDef<ICourse>[] => {
  const columns: ColumnDef<ICourse>[] = [
    {
      accessorKey: 'code',
      header: 'course-code',
      sortingFn: mixedThEnTextSort<ICourse>(),
    },
    {
      accessorKey: 'name',
      header: 'course-name',
      sortingFn: mixedThEnTextSort<ICourse>(),
    },
    {
      accessorKey: 'description',
      header: 'course-description',
      sortingFn: mixedThEnTextSort<ICourse>(),

      cell: (info) => {
        const description = info.getValue<string>();
        const isShowTooltip = description && description.length > 100;
        return (
          <Tooltip>
            <TooltipTrigger>
              <div className="max-w-[300px] truncate">{description || '-'}</div>
            </TooltipTrigger>
            {isShowTooltip && (
              <TooltipContent className="max-w-[250px] break-all">
                <span>{description}</span>
              </TooltipContent>
            )}
          </Tooltip>
        );
      },
    },
    {
      accessorKey: 'users',
      enableSorting: false,
      header: 'course-staff',
      cell: (info) => {
        const users = info.getValue<User[] | undefined>();
        const sortedUser = users?.sort((a, b) =>
          a.firstName.toLowerCase().localeCompare(b.firstName.toLowerCase()),
        );
        return (
          <div className="flex items-center gap-2">
            {sortedUser && sortedUser.length > 0 ? (
              <AvatarGroup max={3} className="align-start">
                {sortedUser.map((user) => (
                  <Avatar
                    key={user.id}
                    className="-ml-2 cursor-pointer first:ml-0"
                    title={`${user.firstName} ${user.lastName || ''}`}
                  >
                    <AvatarImage
                      src={user.profileImageUrl}
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
      cell: (info) => {
        const degree = info.getValue<string>();
        const degreeMap: Record<string, string> = {
          bachelor: tDegree('bachelor'),
          master: tDegree('master'),
          doctorate: tDegree('doctorate'),
        };
        return <span>{degreeMap[degree] || '-'}</span>;
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'created_at',
      sortingFn: 'datetime',
      cell: (row) => {
        const rawDate = row.getValue<string>();
        if (!rawDate) return <span>-</span>;
        const localString = formatShortDate(rawDate, locale);
        return localString;
      },
    },
    {
      accessorKey: 'updatedAt',
      header: 'updated_at',
      sortingFn: 'datetime',
      cell: (row) => {
        const rawDate = row.getValue<string>();
        if (!rawDate) return <span>-</span>;
        const localString = formatShortDate(rawDate, locale);
        return localString;
      },
    },
    {
      accessorKey: 'isUsed',
      header: 'is_used',
      size: 110,
      cell: ({ row, table }) => {
        const record = row.original;
        const { t } = table.options.meta as ColumnActions;

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
              {record.isUsed ? t?.('yes') : t?.('no')}
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
              <DropdownMenuItem
                onSelect={() => onDelete(record.id)}
                disabled={record.isUsed}
              >
                <div className="flex items-center gap-2">
                  <Trash2
                    size={14}
                    color={record.isUsed ? '#9ca3af' : '#e7000b'}
                  />
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
