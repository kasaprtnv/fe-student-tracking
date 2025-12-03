import type { Column } from '@tanstack/react-table';
import type { Option } from './types';
import { useTranslations } from 'next-intl';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { Check, PlusCircle } from 'lucide-react';
import { Badge } from '../ui/badge';

interface DataTableFilterItemProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
  options: Option[];
}

export function DataTableFilterItem<TData, TValue>({
  column,
  title,
  options,
}: DataTableFilterItemProps<TData, TValue>) {
  const t = useTranslations('data-table');
  const unknownValue = column?.getFilterValue();
  const selectedValues = new Set(
    Array.isArray(unknownValue) ? unknownValue : [],
  );

  return (
    <div className="flex border-1 border-dashed">
      <div className="w-[150px]">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-full justify-start border-none"
            >
              <PlusCircle className="mr-2 size-4" />
              {title}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto min-w-(--radix-popover-trigger-width) p-0"
            align="start"
          >
            <Command>
              <CommandInput placeholder={title} />
              <CommandList className="max-h-full">
                <CommandEmpty>{t('no_results')}</CommandEmpty>
                <CommandGroup className="max-h-[18.75rem] overflow-x-hidden overflow-y-auto">
                  {options.map((option, index) => {
                    const isSelected = selectedValues.has(option.value);
                    return (
                      <CommandItem
                        key={`item-${index}`}
                        onSelect={() => {
                          if (isSelected) {
                            selectedValues.delete(option.value);
                          } else {
                            selectedValues.add(option.value);
                          }
                          const filteredValue = Array.from(selectedValues);
                          console.log('Filtered Value:', filteredValue);
                          column?.setFilterValue(
                            filteredValue.length ? filteredValue : undefined,
                          );
                        }}
                      >
                        <div
                          className={cn(
                            'border-primary mr-2 flex size-4 items-center justify-center rounded-sm border',
                            isSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'opacity-50 [&_svg]:invisible',
                          )}
                        >
                          <Check
                            className="size-4"
                            aria-hidden="true"
                            color={'#ffff'}
                          />
                        </div>
                        {option.icon && (
                          <option.icon
                            className="text-muted-foreground mr-2 size-4"
                            aria-hidden="true"
                          />
                        )}
                        <span>{option.label}</span>
                        {option.count && (
                          <span className="ml-auto flex size-4 items-center justify-center font-mono text-xs">
                            {option.count}
                          </span>
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
                {selectedValues.size > 0 && (
                  <>
                    <CommandSeparator />
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => column?.setFilterValue(undefined)}
                        className="justify-center text-center"
                      >
                        {t('clear_filters')}
                      </CommandItem>
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-row p-1">
        {selectedValues?.size > 0 && (
          <>
            <Badge
              variant="secondary"
              className="rounded-sm px-1 font-normal lg:hidden"
            >
              {selectedValues.size}
            </Badge>
            <div className="hidden space-x-1 lg:flex">
              {selectedValues.size > 4 ? (
                <Badge
                  variant="secondary"
                  className="rounded-sm px-1 font-normal"
                >
                  {selectedValues.size} selected
                </Badge>
              ) : (
                options
                  .filter((option) => selectedValues.has(option.value))
                  .map((option, index) => (
                    <Badge
                      variant="secondary"
                      key={`badge-${index}`}
                      className="rounded-sm px-1 font-normal"
                    >
                      {option.label}
                    </Badge>
                  ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
