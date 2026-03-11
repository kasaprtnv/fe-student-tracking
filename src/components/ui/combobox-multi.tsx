'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SelectOption } from '@/types';
import { Button } from './button';
import { useTranslations } from 'next-intl';

interface MultiSelectProps {
  options: SelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxDisplayItems?: number;
  enableEachCancel?: boolean;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = 'placeholder',
  className,
  disabled = false,
  maxDisplayItems = 4,
  enableEachCancel = true,
}: MultiSelectProps) {
  const t = useTranslations('components.multi-select');
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search term
  const filteredOptions = options.filter(
    (option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option?.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Get selected options
  const selectedOptions = options.filter((option) =>
    value.includes(option.value),
  );

  // Handle option selection
  const handleOptionSelect = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  // Remove selected item
  const removeItem = (valueToRemove: string, event: React.MouseEvent) => {
    event.stopPropagation();
    onChange(value.filter((v) => v !== valueToRemove));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Display text for selected items
  const getDisplayText = () => {
    if (selectedOptions.length === 0) {
      return placeholder || t('placeholder');
    }

    if (selectedOptions.length <= maxDisplayItems) {
      return selectedOptions.map((option) => option.label).join(', ');
    }

    return t('selected_items', { count: selectedOptions.length });
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {/* Main Input Area */}
      <div
        className={cn(
          'border-input bg-background ring-offset-background flex min-h-10 w-full cursor-pointer items-center justify-between rounded-md border px-3 py-2 text-sm',
          'focus-within:ring-ring focus-within:ring-2 focus-within:ring-offset-2',
          disabled && 'cursor-not-allowed opacity-50',
          isOpen && 'ring-ring ring-2 ring-offset-2',
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex flex-1 flex-wrap gap-1">
          {/* Selected Items Display */}
          {selectedOptions.length > 0 &&
          selectedOptions.length <= maxDisplayItems ? (
            selectedOptions.map((option) => (
              <span
                key={option.value}
                className="bg-secondary inline-flex items-center gap-1 rounded px-2 py-1 text-xs"
              >
                {option.label}
                {!disabled && enableEachCancel && (
                  <Button
                    onClick={(e) => removeItem(option.value, e)}
                    className="hover:bg-secondary-foreground/20 ml-1 h-3 w-3 rounded-sm"
                  >
                    <X className="h-2 w-2" />
                  </Button>
                )}
              </span>
            ))
          ) : (
            <span
              className={cn(
                'truncate',
                selectedOptions.length === 0
                  ? 'text-muted-foreground'
                  : 'text-foreground',
              )}
            >
              {getDisplayText()}
            </span>
          )}
        </div>

        {/* Clear All Button */}
        {selectedOptions.length > 0 && !disabled && (
          <Button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange([]);
            }}
            className="mr-2 h-5 w-5 rounded-sm"
          >
            <X className="h-3 w-3" />
          </Button>
        )}

        {/* Dropdown Arrow */}
        <ChevronDown
          className={cn(
            'text-muted-foreground h-4 w-4 transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
        />
      </div>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="bg-popover absolute top-full z-50 mt-1 w-full rounded-md border shadow-lg">
          {/* Search Input */}
          <div className="p-2">
            <input
              ref={inputRef}
              type="text"
              placeholder={t('search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-input bg-background focus:ring-ring w-full rounded border px-2 py-1 text-sm focus:ring-1 focus:outline-none"
              autoFocus
            />
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-auto">
            {filteredOptions.length === 0 ? (
              <div className="text-muted-foreground px-2 py-3 text-center text-sm">
                {t('no_results')}
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = value.includes(option.value);
                return (
                  <div
                    key={option.value}
                    className={cn(
                      'hover:bg-accent hover:text-accent-foreground flex cursor-pointer items-center justify-between px-2 py-2 text-sm',
                      isSelected && 'bg-accent/50',
                    )}
                    onClick={() => handleOptionSelect(option.value)}
                  >
                    <div className="flex-1 space-y-1">
                      <div className="leading-tight">{option.label}</div>
                      <div className="text-muted-foreground text-xs leading-relaxed">
                        {option.description}
                      </div>
                    </div>
                    {isSelected && <Check className="text-primary h-4 w-4" />}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer with count */}
          {selectedOptions.length > 0 && (
            <div className="text-muted-foreground border-t px-2 py-2 text-xs">
              {t('selected_items', { count: selectedOptions.length })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
