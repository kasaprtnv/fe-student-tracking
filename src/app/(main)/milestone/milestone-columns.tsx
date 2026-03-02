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
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { mixedThEnTextSort } from '@/lib/table-sorted';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatShortDate } from '@/lib/format-date';

interface ColumnActions {
  onEdit?: (data: IMilestone) => void;
  onDelete?: (id: string) => void;
  onActiveChange?: (id: string, isActive: boolean) => void;
  onLink?: (id: string) => void;
  t?: (key: string) => string;
}

export const createMilestoneColumns = (
  locale: string = 'th',
): ColumnDef<IMilestone>[] => {
  const columns: ColumnDef<IMilestone>[] = [
    {
      accessorKey: 'name',
      header: 'milestone-name',
      sortingFn: mixedThEnTextSort<IMilestone>(),
    },
    {
      accessorKey: 'description',
      header: 'milestone-description',
      sortingFn: mixedThEnTextSort<IMilestone>(),
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
    // {
    //   accessorKey: 'dayPeriod',
    //   header: 'day-period',
    // },
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
    // {
    //   accessorKey: 'notifyBeforeDays',
    //   header: 'notify-before-days',
    // },
    {
      accessorKey: 'isUsed',
      header: 'is_used',
      size: 110,
      cell: ({ row, table }) => {
        const record = row.original;

        const { t } = table.options.meta as {
          t: (key: string) => string;
        };

        if (typeof record.isUsed !== 'boolean') {
          return (
            <div className="flex w-[110px] items-center justify-center">-</div>
          );
        }

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
              {record.isUsed ? t('yes') : t('no')}
            </Badge>
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
                className={
                  record.isUsed ? 'pointer-events-none opacity-50' : ''
                }
              >
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
