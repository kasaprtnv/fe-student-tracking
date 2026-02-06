'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface DynamicInputListProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  buttonLabel?: string;
}

// Helper function to normalize value for comparison
const normalizeValue = (val: string | undefined): string => {
  if (!val) return '';
  return val
    .split(',')
    .map((i) => i.trim())
    .filter((i) => i !== '')
    .join(',');
};

// Helper function to parse value to items array
const parseValueToItems = (val: string | undefined): string[] => {
  if (!val) return [''];
  return val.split(',').map((item) => item.trim());
};

export function DynamicInputList({
  value = '',
  onChange,
  placeholder,
  className,
  disabled = false,
  buttonLabel = 'Add Item',
}: DynamicInputListProps) {
  // Track previous value to detect external changes
  const prevValueRef = useRef(value);
  const lastEmittedRef = useRef(value);

  // Parse the initial comma-separated string into an array
  const [items, setItems] = useState<string[]>(() => parseValueToItems(value));

  // Sync internal state if external value changes (not from our own update)
  // This pattern is necessary for controlled inputs that need internal state
  // eslint-disable-next-line react-hooks/refs
  const lastEmitted = lastEmittedRef.current;
  // eslint-disable-next-line react-hooks/refs
  const prevValue = prevValueRef.current;

  const normalizedValue = normalizeValue(value);
  const normalizedLastEmitted = normalizeValue(lastEmitted);
  const normalizedPrev = normalizeValue(prevValue);

  if (
    normalizedValue !== normalizedPrev &&
    normalizedValue !== normalizedLastEmitted
  ) {
    // External value changed - schedule state update
    // eslint-disable-next-line react-hooks/refs
    prevValueRef.current = value;
    // eslint-disable-next-line react-hooks/refs
    lastEmittedRef.current = value;
    const newItems = parseValueToItems(value);
    if (JSON.stringify(newItems) !== JSON.stringify(items)) {
      setItems(newItems);
    }
  } else if (normalizedValue !== normalizedPrev) {
    // eslint-disable-next-line react-hooks/refs
    prevValueRef.current = value;
  }

  const updateParent = (newItems: string[]) => {
    // Filter out empty strings before joining
    const joined = newItems
      .map((i) => i.trim())
      .filter((i) => i !== '')
      .join(',');

    // Update ref BEFORE calling onChange to prevent race condition
    lastEmittedRef.current = joined;
    onChange(joined);
  };

  const handleChange = (index: number, newValue: string) => {
    const newItems = [...items];
    newItems[index] = newValue;
    setItems(newItems);
    updateParent(newItems);
  };

  const handleAdd = () => {
    const newItems = [...items, ''];
    setItems(newItems);
    updateParent(newItems);
  };

  const handleRemove = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    if (newItems.length === 0) {
      newItems.push('');
    }
    setItems(newItems);
    updateParent(newItems);
  };

  return (
    <div className={cn('space-y-2', className)}>
      {items.map((item, index) => (
        <div key={index} className="relative flex items-center">
          <Input
            value={item}
            onChange={(e) => handleChange(index, e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1 pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled || (items.length === 1 && !items[0])}
            onClick={() => handleRemove(index)}
            className="absolute top-0 right-0 h-full px-3 text-gray-500 hover:text-red-500"
            title="Remove"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={handleAdd}
        className="mt-1 w-full border-dashed"
      >
        <Plus className="mr-2 size-4" />
        {buttonLabel}
      </Button>
    </div>
  );
}
