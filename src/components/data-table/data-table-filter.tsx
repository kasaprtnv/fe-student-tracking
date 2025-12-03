import { Table } from '@tanstack/react-table';
import { DataTableFilterField } from './types';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Filter, X } from 'lucide-react';
import { DataTableFilterItem } from './data-table-filter-item';
import { useTranslations } from 'next-intl';

interface DataTableFilterProps<TData> {
  table: Table<TData>;
  filterColumns: DataTableFilterField<TData>[];
  title: string;
}

export function DataTableFilter<TData>({
  table,
  filterColumns,
  title,
}: DataTableFilterProps<TData>) {
  const t = useTranslations('data-table');
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <Filter className="mr-2 size-4" />
          {title}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto min-w-(--radix-popover-trigger-width) p-0"
        align="start"
      >
        <div className="flex min-w-[300px] flex-col gap-2 p-4">
          {filterColumns.map(
            (column) =>
              table.getColumn(column.id ? String(column.id) : '') && (
                <DataTableFilterItem
                  key={String(column.id)}
                  column={table.getColumn(column.id ? String(column.id) : '')}
                  title={column.label}
                  options={column.options ?? []}
                />
              ),
          )}
          <Button
            aria-label="Reset filters"
            variant="outline"
            className="h-8 px-2 lg:px-3"
            onClick={() => table.resetColumnFilters()}
          >
            <X className="ml-2 size-4" aria-hidden="true" />
            {t('reset_filters')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
