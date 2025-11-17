import { Table } from '@tanstack/react-table';
import { DataTableFilterField } from './types';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Filter } from 'lucide-react';
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
      <PopoverTrigger>
        <Button variant="outline" size="sm" className="h-8 px-3">
          <Filter className="mr-2 size-4" />
          {title}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto min-w-(--radix-popover-trigger-width) p-0"
        align="start"
      >
        <div className="flex min-w-[300px] flex-col gap-2 p-4">
          {filterColumns.map((column) => {
            const col = table.getColumn(column.id ? String(column.id) : '');
            return (
              col && (
                <DataTableFilterItem
                  key={String(column.id)}
                  column={col}
                  title={column.label}
                  options={column.options ?? []}
                />
              )
            );
          })}
          <Button
            aria-label="Reset filters"
            variant="outline"
            className="h-8 lg:px-3"
          >
            {t('reset_filters')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
