'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Option {
  label: string;
  value: string;
}

interface SingleComboboxProps {
  options: Option[];
  value?: string;
  onChange: (value: string | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  clearable?: boolean; // สามารถลบการเลือกได้
}

export function SingleCombobox({
  options,
  value,
  onChange,
  placeholder = 'เลือกรายการ...',
  className,
  disabled = false,
  clearable = true,
}: SingleComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Get selected option
  const selectedOption = options.find((option) => option.value === value);

  // Handle option selection
  const handleOptionSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  // Clear selection
  const clearSelection = (event: React.MouseEvent) => {
    event.stopPropagation();
    onChange(null);
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

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

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
        {/* Selected Option Display */}
        <span
          className={cn(
            'flex-1 truncate',
            selectedOption ? 'text-foreground' : 'text-muted-foreground',
          )}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        {/* Clear Button */}
        {selectedOption && clearable && !disabled && (
          <button
            type="button"
            onClick={clearSelection}
            className="hover:bg-secondary mr-2 h-4 w-4 rounded-sm"
            title="ลบการเลือก"
          >
            <X className="h-3 w-3" />
          </button>
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
              placeholder="ค้นหา..."
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
                ไม่พบรายการที่ค้นหา
              </div>
            ) : (
              <>
                {/* Clear option (if clearable) */}
                {clearable && selectedOption && (
                  <div
                    className="hover:bg-accent hover:text-accent-foreground flex cursor-pointer items-center border-b px-3 py-2 text-sm"
                    onClick={() => {
                      onChange(null);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                  >
                    <span className="text-muted-foreground italic">
                      ไม่เลือกรายการใด
                    </span>
                  </div>
                )}

                {/* Options */}
                {filteredOptions.map((option) => {
                  const isSelected = option.value === value;
                  return (
                    <div
                      key={option.value}
                      className={cn(
                        'hover:bg-accent hover:text-accent-foreground flex cursor-pointer items-center justify-between px-3 py-2 text-sm',
                        isSelected && 'bg-accent/50',
                      )}
                      onClick={() => handleOptionSelect(option.value)}
                    >
                      <span className="flex-1">{option.label}</span>
                      {isSelected && <Check className="text-primary h-4 w-4" />}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
