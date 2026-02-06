'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface DynamicInputListProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  buttonLabel?: string;
}

export function DynamicInputList({
  value = '',
  onChange,
  placeholder,
  className,
  disabled = false,
  buttonLabel = 'Add Item',
}: DynamicInputListProps) {
  // Parse the initial comma-separated string into an array
  // If value is empty, start with one empty string to show one input
  const [items, setItems] = useState<string[]>(() => {
    if (!value) return [''];
    return value.split(',').map((item) => item.trim()); // trim for cleaner display
  });

  const lastEmittedRef = React.useRef(value);

  // Helper function to normalize value for comparison
  const normalizeValue = (val: string | undefined): string => {
    if (!val) return '';
    return val
      .split(',')
      .map((i) => i.trim())
      .filter((i) => i !== '')
      .join(',');
  };

  // Sync internal state if external value changes (and it's not our own update)
  useEffect(() => {
    // Normalize both values for proper comparison
    const normalizedValue = normalizeValue(value);
    const normalizedLastEmitted = normalizeValue(lastEmittedRef.current);

    // If the incoming value is different from what we last emitted,
    // it means the parent changed it (e.g. form reset, or loaded from DB)
    if (normalizedValue !== normalizedLastEmitted) {
      if (!value) {
        setItems(['']);
      } else {
        setItems(value.split(',').map((item) => item.trim()));
      }
      lastEmittedRef.current = value;
    }
  }, [value]);

  const updateParent = (newItems: string[]) => {
    // Filter out empty strings before joining
    // This prevents keeping ",," or "A,,B" in the form state
    const joined = newItems
      .map((i) => i.trim())
      .filter((i) => i !== '')
      .join(',');

    // Update ref BEFORE calling onChange to prevent race condition in useEffect
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
    // We don't necessarily need to trigger onChange here as it's just an empty field,
    // but consistency might be good. Let's wait until they type to trigger change?
    // Actually, trigger change so parent knows there's a "change" (e.g. getting dirty).
    updateParent(newItems);
  };

  const handleRemove = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    if (newItems.length === 0) {
      newItems.push(''); // Always keep at least one input?
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
