import { Column, Table } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Check, ChevronsUpDown, Settings2 } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command';
import { cn, toSentenceCase } from '@/lib/utils';

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
  setHiddenColumns?: (
    hiddenColumns: Column<TData, unknown>[],
  ) => Column<TData, unknown>[];
}

export function DataTableViewOptions<TData>({
  table,
  setHiddenColumns,
}: DataTableViewOptionsProps<TData>) {
  const t = useTranslations('data-table');
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (setHiddenColumns) {
      const hiddenColumns = table
        .getAllColumns()
        .filter((column) => column.getIsVisible() === false);
      setHiddenColumns(hiddenColumns);
    }
  }, [table, setHiddenColumns]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          aria-label="Toggle Columns"
          role="combobox"
          className="focus:ring-ring ml-auto hidden gap-2 focus:ring-1 focus:outline-hidden focus-visible:ring-0 lg:flex"
        >
          <Settings2 className="size-4" />
          {t('view_options')}
          <ChevronsUpDown className="ml-auto size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[200px] p-0"
        onCloseAutoFocus={() => triggerRef.current?.focus()}
      >
        <Command>
          <CommandInput placeholder={t('search_columns')} />
          <CommandList>
            <CommandEmpty>{t('no_results')}</CommandEmpty>
            <CommandGroup>
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== 'undefined' &&
                    column.getCanHide(),
                )
                .map((column) => {
                  return (
                    <CommandItem
                      key={column.id}
                      onSelect={() =>
                        column.toggleVisibility(!column.getIsVisible())
                      }
                    >
                      <span className="truncate">
                        {
                          toSentenceCase(
                            column.columnDef.header?.toString() ?? '',
                          ).replace(/\b\w/g, (c) => c.toUpperCase()) // Capitalize each word
                        }
                      </span>
                      <Check
                        className={cn(
                          'ml-auto size-4',
                          column.getIsVisible() ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                    </CommandItem>
                  );
                })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
