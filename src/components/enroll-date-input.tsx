'use client';

import React from 'react';
import { FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { th } from 'date-fns/locale';
import { formatThaiDate, parseThaiDate } from '@/lib/format-date';

interface EnrollDateInputProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  onBlur?: () => void;
}

export function EnrollDateInput({
  value: externalValue,
  onChange,
  disabled = false,
  onBlur,
}: EnrollDateInputProps) {
  const [inputValue, setInputValue] = React.useState('');

  // Sync from externalValue to inputValue only when externalValue changes properly
  React.useEffect(() => {
    if (externalValue) {
      const parsedCurrent = parseThaiDate(inputValue);
      if (
        !parsedCurrent ||
        parsedCurrent.getTime() !== new Date(externalValue).getTime()
      ) {
        setInputValue(formatThaiDate(externalValue));
      }
    } else {
      // If external value is cleared, clear input?
      // setInputValue(''); // Optional: decided not to force clear if user is typing
    }
  }, [externalValue, inputValue]);

  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    const date = parseThaiDate(val);
    if (date) {
      // Check if date is not in the future
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Set to end of today to allow selecting today

      if (date <= today) {
        onChange(date.toISOString());
      } else {
        // If future date, still pass it to allow validation to catch it
        onChange(date.toISOString());
      }
    } else {
      // If invalid, clear the field value so it doesn't submit junk
      // We only clear if the external value was previously set to something valid
      if (externalValue) onChange('');
    }
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      // Use Date object for ISO string to ensure consistent timezone handling (UTC)
      // react-day-picker usually returns 00:00:00 local time ?? No, it returns Date object.
      // We want to store the DATE part primarily. ISO String is fine if backend handles it as Date.
      onChange(date.toISOString());
      setInputValue(formatThaiDate(date));
      setIsPopoverOpen(false);
    } else {
      onChange('');
      setInputValue('');
    }
  };

  return (
    <div className="relative">
      <FormControl>
        <Input
          disabled={disabled}
          placeholder="DD/MM/YYYY"
          className="border-gray-300 pr-10 focus:border-blue-500 focus:ring-blue-500"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={onBlur}
          maxLength={10}
          onKeyDown={(e) => {
            if (e.key === '/') {
              // Prevent if already has 2 slashes
              const slashes = (inputValue.match(/\//g) || []).length;
              if (slashes >= 2) {
                e.preventDefault();
                return;
              }
            }

            // Allow: backspace, delete, tab, escape, enter, and /
            if (
              ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', '/'].includes(
                e.key,
              ) ||
              // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
              (e.ctrlKey === true &&
                ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) ||
              // Allow: home, end, left, right
              ['Home', 'End', 'ArrowLeft', 'ArrowRight'].includes(e.key)
            ) {
              return;
            }
            // Ensure that it is a number and stop the keypress
            if ((e.key < '0' || e.key > '9') && e.key !== '/') {
              e.preventDefault();
            }
          }}
        />
      </FormControl>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            disabled={disabled}
            variant="ghost"
            size="icon"
            className="absolute top-0 right-0 h-full px-3 text-gray-500 hover:text-gray-700"
          >
            <CalendarIcon className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={externalValue ? new Date(externalValue) : undefined}
            onSelect={handleCalendarSelect}
            locale={th}
            initialFocus
            disabled={(date) => date > new Date()}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
