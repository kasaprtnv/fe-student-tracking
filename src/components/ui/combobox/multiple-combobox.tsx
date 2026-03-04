'use client';

import { Check, ChevronsUpDown, Loader } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
// types
// import { SelectOption } from '@/types';

interface MultiComboboxProps {
  defaultValue?: string[];
  onChange?: (values: string[]) => void;
  options: {
    label: string;
    value: string;
    description?: string;
  }[];
  placeholder: string;
  placeholderSearch: string;
  placeholderEmpty: string;
  errorMessage?: string;
  loader?: boolean;
  disabled?: boolean;
}

export function MultiCombobox({
  defaultValue = [],
  onChange,
  options,
  placeholder,
  placeholderSearch,
  placeholderEmpty,
  errorMessage,
  loader = false,
  disabled = false,
}: MultiComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [values, setValues] = React.useState<Set<string>>(
    new Set(defaultValue),
  );

  const toggleValue = (val: string) => {
    const newSet = new Set(values);
    if (newSet.has(val)) {
      newSet.delete(val);
    } else {
      newSet.add(val);
    }
    setValues(newSet);
    onChange?.(Array.from(newSet));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          onClick={() => !disabled && setOpen(!open)}
          role="combobox"
          aria-expanded={open}
          tabIndex={0}
          disabled={disabled}
          className={cn(
            'border-input h-[max-content] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-normal transition-all',
            'focus:ring-ring focus:ring-1 focus:outline-none',
            'flex items-center justify-between',
            errorMessage && 'border-red-500',
          )}
        >
          <div className="flex min-w-0 flex-1 flex-wrap gap-1">
            {values.size > 0 && !loader ? (
              [...values].map((val) => (
                <div
                  key={val}
                  className="flex items-center rounded bg-gray-200 px-2 py-1 text-sm dark:bg-neutral-700 dark:text-neutral-200"
                >
                  {options.find((opt) => opt.value === val)?.label || val}
                </div>
              ))
            ) : (
              <span className="opacity-60">{placeholder}</span>
            )}
          </div>
          {loader ? (
            <Loader className="mr-2 size-4 animate-spin" aria-hidden="true" />
          ) : (
            <ChevronsUpDown className="opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] max-w-[var(--radix-popover-trigger-width)] p-0"
        onWheel={(e) => e.stopPropagation()}
      >
        <Command
          filter={(value, search) => {
            if (
              value.toLocaleLowerCase().includes(search.toLocaleLowerCase())
            ) {
              return 1;
            }
            return 0;
          }}
        >
          <CommandInput placeholder={placeholderSearch} />
          <CommandList className="max-h-60 overflow-y-auto">
            <CommandEmpty>{placeholderEmpty}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => toggleValue(option.value)}
                >
                  <div className="flex w-full flex-col text-left leading-tight">
                    <span
                      className="truncate overflow-hidden whitespace-nowrap"
                      title={option.label}
                    >
                      {option.label}
                    </span>
                    {option.description && (
                      <span className="text-muted-foreground truncate overflow-hidden text-xs whitespace-nowrap">
                        {option.description}
                      </span>
                    )}
                  </div>
                  <Check
                    className={cn(
                      'ml-auto',
                      values.has(option.value) ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
      {errorMessage && <p className="text-xs text-red-500">{errorMessage}</p>}
    </Popover>
  );
}
