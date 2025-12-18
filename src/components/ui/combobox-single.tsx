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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-full justify-between font-normal ${errorMessage && 'border-red-500'} dark:bg-neutral-800 dark:text-gray-200`}
          disabled={disabled}
        >
          {value ? (
            options.find((option) => option.value === value)?.label
          ) : (
            <span className="opacity-60">
              {placeholder ?? 'Select option...'}
            </span>
          )}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      {!disabled && (
        <PopoverContent className="w-full min-w-[var(--radix-popover-trigger-width)] p-0">
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
                  >
                    {option.label}
                    <Check
                      className={cn(
                        'ml-auto',
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
