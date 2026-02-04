'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
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
// types
import { SelectOption } from '@/types';

interface SingleComboboxProps {
  defaultValue?: string;
  onChange?: (value: string) => void;
  options: SelectOption[];
  placeholder: string;
  placeholderSearch: string;
  placeholderEmpty: string;
  errorMessage?: string;
  disabled?: boolean;
}

export function SingleCombobox({
  defaultValue = '',
  onChange,
  options,
  placeholder,
  placeholderSearch,
  placeholderEmpty,
  errorMessage,
  disabled = false,
}: SingleComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(defaultValue);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-full justify-between overflow-hidden border border-gray-300 bg-white font-normal ${errorMessage && 'border-red-500'} dark:bg-neutral-800 dark:text-gray-200`}
          disabled={disabled}
        >
          <span
            className="block min-w-0 flex-1 truncate text-left"
            title={
              value
                ? options.find((option) => option.value === value)?.label
                : undefined
            }
          >
            {value ? (
              options.find((option) => option.value === value)?.label
            ) : (
              <span className="opacity-60">
                {placeholder ?? 'Select option...'}
              </span>
            )}
          </span>
          <ChevronsUpDown className="ml-2 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      {!disabled && (
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] max-w-[var(--radix-popover-trigger-width)] p-0">
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
            <CommandInput
              placeholder={placeholderSearch ?? 'Search option...'}
            />
            <CommandList>
              <CommandEmpty>
                {placeholderEmpty ?? 'No option found.'}
              </CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={(selectedLabel) => {
                      const selected = options.find(
                        (option) => option.label === selectedLabel,
                      );
                      const newValue = selected?.value ?? '';
                      setValue(newValue);
                      onChange?.(newValue);
                      setOpen(false);
                    }}
                    className="flex items-center gap-2"
                  >
                    <span
                      className="min-w-0 flex-1 truncate"
                      title={option.label}
                    >
                      {option.label}
                    </span>
                    <Check
                      className={cn(
                        'ml-auto shrink-0',
                        value === option.value ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      )}
      {errorMessage && (
        <p className="text-xs font-semibold text-red-500">{errorMessage}</p>
      )}
    </Popover>
  );
}
