'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
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

interface CompactMultiComboboxProps {
  value?: string[];
  onChange?: (values: string[]) => void;
  options: {
    label: string;
    value: string;
  }[];
  placeholder: string;
  placeholderSearch?: string;
  placeholderEmpty?: string;
  className?: string;
  maxDisplayLength?: number;
}

export function CompactMultiCombobox({
  value = [],
  onChange,
  options,
  placeholder,
  placeholderSearch = 'Search...',
  placeholderEmpty = 'No results found',
  className,
  maxDisplayLength = 12,
}: CompactMultiComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const toggleValue = (val: string) => {
    const newValues = value.includes(val)
      ? value.filter((v) => v !== val)
      : [...value, val];
    onChange?.(newValues);
  };

  // Compact display text
  const displayText = React.useMemo(() => {
    if (value.length === 0) {
      return placeholder;
    }
    if (value.length === 1) {
      const name = options.find((o) => o.value === value[0])?.label || value[0];
      return name.length > maxDisplayLength
        ? name.slice(0, maxDisplayLength) + '...'
        : name;
    }
    const firstName =
      options.find((o) => o.value === value[0])?.label || value[0];
    const truncatedName =
      firstName.length > maxDisplayLength - 3
        ? firstName.slice(0, maxDisplayLength - 3) + '...'
        : firstName;
    return `${truncatedName} +${value.length - 1}`;
  }, [value, options, placeholder, maxDisplayLength]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'h-9 w-auto min-w-[120px] justify-between text-sm font-normal',
            className,
          )}
        >
          <span className="truncate">{displayText}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command
          filter={(cmdValue, search) => {
            if (cmdValue.toLowerCase().includes(search.toLowerCase())) {
              return 1;
            }
            return 0;
          }}
        >
          <CommandInput placeholder={placeholderSearch} />
          <CommandList>
            <CommandEmpty>{placeholderEmpty}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => toggleValue(option.value)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value.includes(option.value)
                        ? 'opacity-100'
                        : 'opacity-0',
                    )}
                  />
                  <span className="truncate">{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
