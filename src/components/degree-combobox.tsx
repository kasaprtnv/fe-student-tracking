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
import { useTranslations } from 'next-intl';

interface DegreesComboboxProps {
  defaultValue?: string;
  onChange?: (value: string) => void;
}

export function DegreesCombobox({
  defaultValue,
  onChange,
}: DegreesComboboxProps) {
  const t = useTranslations('degree');
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(defaultValue || '');

  const degrees = [
    {
      value: 'bachelor',
      label: t('bachelor'),
    },
    {
      value: 'master',
      label: t('master'),
    },
    {
      value: 'doctorate',
      label: t('doctorate'),
    },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between',
            !value && 'text-muted-foreground hover:text-muted-foreground',
          )}
        >
          {value
            ? degrees.find((degree) => degree.value === value)?.label
            : t('select-degree')}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full min-w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder={t('search-degree')} className="h-9" />
          <CommandList>
            <CommandEmpty>{t('not-found')}</CommandEmpty>
            <CommandGroup>
              {degrees.map((degree) => (
                <CommandItem
                  key={degree.value}
                  value={degree.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? '' : currentValue);
                    setOpen(false);
                    onChange?.(currentValue === value ? '' : currentValue);
                  }}
                >
                  {degree.label}
                  <Check
                    className={cn(
                      'ml-auto',
                      value === degree.value ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
