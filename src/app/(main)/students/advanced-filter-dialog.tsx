'use client';

import React from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { useTranslations } from 'next-intl';
import { Filter, RotateCcw, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { th, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useLocale } from 'next-intl';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandInput,
} from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';

export interface AdvancedFilterValues {
  code: string;
  fullName: string;
  email: string;
  phone: string;
  major: string;
  degree: string[];
  year: string[];
  courseId: string[];
  studyPlan: string[];
  enrollDateFrom: Date | undefined;
  enrollDateTo: Date | undefined;
  graduated: string[];
}

export const defaultFilterValues: AdvancedFilterValues = {
  code: '',
  fullName: '',
  email: '',
  phone: '',
  major: '',
  degree: [],
  year: [],
  courseId: [],
  studyPlan: [],
  enrollDateFrom: undefined,
  enrollDateTo: undefined,
  graduated: [],
};

interface AdvancedFilterPopoverProps {
  onApply: (filters: AdvancedFilterValues) => void;
  currentFilters: AdvancedFilterValues;
  degreeOptions: { label: string; value: string }[];
  yearOptions: { label: string; value: string }[];
  courseOptions: { label: string; value: string }[];
  studyPlanOptions: { label: string; value: string }[];
  graduatedOptions: { label: string; value: string }[];
  isActive: boolean;
}

export function AdvancedFilterPopover({
  onApply,
  currentFilters,
  degreeOptions,
  yearOptions,
  courseOptions,
  studyPlanOptions,
  graduatedOptions,
  isActive,
}: AdvancedFilterPopoverProps) {
  const t = useTranslations('advanced-filter');
  const locale = useLocale();
  const dateLocale = locale === 'th' ? th : enUS;
  const [open, setOpen] = React.useState(false);
  const [filters, setFilters] =
    React.useState<AdvancedFilterValues>(currentFilters);

  React.useEffect(() => {
    if (open) {
      setFilters(currentFilters);
    }
  }, [open, currentFilters]);

  const toggleArrayValue = (arr: string[], value: string) => {
    return arr.includes(value)
      ? arr.filter((v) => v !== value)
      : [...arr, value];
  };

  const handleApply = () => {
    onApply(filters);
    setOpen(false);
  };

  const handleReset = () => {
    setFilters(defaultFilterValues);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant={isActive ? 'default' : 'outline'}>
          <Filter className="mr-2 h-4 w-4" />
          {t('filter-button')}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[600px] p-4" align="end">
        <div className="mb-4">
          <h4 className="font-semibold">{t('title')}</h4>
          <p className="text-muted-foreground text-sm">{t('description')}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Row 1: Code, Full Name */}
          <div className="space-y-1">
            <Label htmlFor="code" className="text-xs">
              {t('code')}
            </Label>
            <Input
              id="code"
              placeholder={t('code-placeholder')}
              value={filters.code}
              onChange={(e) => setFilters({ ...filters, code: e.target.value })}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="fullName" className="text-xs">
              {t('full-name')}
            </Label>
            <Input
              id="fullName"
              placeholder={t('full-name-placeholder')}
              value={filters.fullName}
              onChange={(e) =>
                setFilters({ ...filters, fullName: e.target.value })
              }
              className="h-8 text-sm"
            />
          </div>

          {/* Row 2: Email, Phone */}
          <div className="space-y-1">
            <Label htmlFor="email" className="text-xs">
              {t('email')}
            </Label>
            <Input
              id="email"
              placeholder={t('email-placeholder')}
              value={filters.email}
              onChange={(e) =>
                setFilters({ ...filters, email: e.target.value })
              }
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="phone" className="text-xs">
              {t('phone')}
            </Label>
            <Input
              id="phone"
              placeholder={t('phone-placeholder')}
              value={filters.phone}
              onChange={(e) =>
                setFilters({ ...filters, phone: e.target.value })
              }
              className="h-8 text-sm"
            />
          </div>

          {/* Row 3: Major, Degree */}
          <div className="space-y-1">
            <Label htmlFor="major" className="text-xs">
              {t('major')}
            </Label>
            <Input
              id="major"
              placeholder={t('major-placeholder')}
              value={filters.major}
              onChange={(e) =>
                setFilters({ ...filters, major: e.target.value })
              }
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{t('degree')}</Label>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between text-sm font-normal"
                >
                  <div className="flex flex-wrap gap-1">
                    {filters.degree.length > 0 ? (
                      filters.degree.map((val) => (
                        <span
                          key={val}
                          className="bg-muted rounded px-2 py-0.5 text-xs"
                        >
                          {degreeOptions.find((o) => o.value === val)?.label ??
                            val}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted-foreground">
                        {t('degree-placeholder')}
                      </span>
                    )}
                  </div>
                  <ChevronsUpDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command>
                  <CommandInput placeholder={t('search')} />
                  <CommandEmpty>{t('no-results')}</CommandEmpty>
                  <CommandGroup>
                    {degreeOptions.map((option) => (
                      <CommandItem
                        key={option.value}
                        onSelect={() =>
                          setFilters({
                            ...filters,
                            degree: toggleArrayValue(
                              filters.degree,
                              option.value,
                            ),
                          })
                        }
                      >
                        <span>{option.label}</span>
                        <Check
                          className={cn(
                            'ml-auto h-4 w-4',
                            filters.degree.includes(option.value)
                              ? 'opacity-100'
                              : 'opacity-0',
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{t('year')}</Label>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between text-sm font-normal"
                >
                  <div className="flex flex-wrap gap-1">
                    {filters.year.length > 0 ? (
                      filters.year.map((val) => (
                        <span
                          key={val}
                          className="bg-muted rounded px-2 py-0.5 text-xs"
                        >
                          {yearOptions.find((o) => o.value === val)?.label ??
                            val}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted-foreground">
                        {t('year-placeholder')}
                      </span>
                    )}
                  </div>
                  <ChevronsUpDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command>
                  <CommandInput placeholder={t('search')} />
                  <CommandEmpty>{t('no-results')}</CommandEmpty>
                  <CommandGroup>
                    {yearOptions.map((option) => (
                      <CommandItem
                        key={option.value}
                        onSelect={() =>
                          setFilters({
                            ...filters,
                            year: toggleArrayValue(filters.year, option.value),
                          })
                        }
                      >
                        <span>{option.label}</span>
                        <Check
                          className={cn(
                            'ml-auto h-4 w-4',
                            filters.year.includes(option.value)
                              ? 'opacity-100'
                              : 'opacity-0',
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Row 4: Year, Course */}
          <div className="space-y-1">
            <Label className="text-xs">{t('course')}</Label>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    'w-full justify-between text-sm font-normal',
                    filters.courseId.length === 2 && 'h-auto min-h-[36px]',
                  )}
                >
                  <div className="flex min-w-0 flex-1 flex-wrap gap-1 overflow-hidden">
                    {filters.courseId.length > 2 ? (
                      <span className="bg-muted rounded px-2 py-0.5 text-xs">
                        {t('selected-count', {
                          count: filters.courseId.length,
                        })}
                      </span>
                    ) : filters.courseId.length > 0 ? (
                      filters.courseId.map((val) => (
                        <span
                          key={val}
                          className="bg-muted max-w-[180px] truncate rounded px-2 py-0.5 text-xs"
                          title={
                            courseOptions.find((o) => o.value === val)?.label ??
                            val
                          }
                        >
                          {courseOptions.find((o) => o.value === val)?.label ??
                            val}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted-foreground">
                        {t('course-placeholder')}
                      </span>
                    )}
                  </div>
                  <ChevronsUpDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command>
                  <CommandInput placeholder={t('search')} />
                  <CommandEmpty>{t('no-results')}</CommandEmpty>
                  <CommandGroup>
                    {courseOptions.map((option) => (
                      <CommandItem
                        key={option.value}
                        onSelect={() =>
                          setFilters({
                            ...filters,
                            courseId: toggleArrayValue(
                              filters.courseId,
                              option.value,
                            ),
                          })
                        }
                      >
                        <span className="truncate" title={option.label}>
                          {option.label}
                        </span>
                        <Check
                          className={cn(
                            'ml-auto h-4 w-4',
                            filters.courseId.includes(option.value)
                              ? 'opacity-100'
                              : 'opacity-0',
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">{t('study-plan')}</Label>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between text-sm font-normal"
                >
                  <div className="flex flex-wrap gap-1">
                    {filters.studyPlan.length > 0 ? (
                      filters.studyPlan.map((val) => (
                        <span
                          key={val}
                          className="bg-muted rounded px-2 py-0.5 text-xs"
                        >
                          {studyPlanOptions.find((o) => o.value === val)
                            ?.label ?? val}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted-foreground">
                        {t('study-plan-placeholder')}
                      </span>
                    )}
                  </div>
                  <ChevronsUpDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command>
                  <CommandInput placeholder={t('search')} />
                  <CommandEmpty>{t('no-results')}</CommandEmpty>
                  <CommandGroup>
                    {studyPlanOptions.map((option) => (
                      <CommandItem
                        key={option.value}
                        onSelect={() =>
                          setFilters({
                            ...filters,
                            studyPlan: toggleArrayValue(
                              filters.studyPlan,
                              option.value,
                            ),
                          })
                        }
                      >
                        <span>{option.label}</span>
                        <Check
                          className={cn(
                            'ml-auto h-4 w-4',
                            filters.studyPlan.includes(option.value)
                              ? 'opacity-100'
                              : 'opacity-0',
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Row 5: Enroll Date Range - Now uses Calendar picker */}
          <div className="space-y-1">
            <Label className="text-xs">{t('enroll-date-range')}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'border-input min-h-[38px] w-full justify-start px-3 py-2 text-left text-sm font-normal',
                    !filters.enrollDateFrom &&
                      !filters.enrollDateTo &&
                      'text-muted-foreground',
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.enrollDateFrom && filters.enrollDateTo ? (
                    <>
                      {format(filters.enrollDateFrom, 'dd MMM yyyy', {
                        locale: dateLocale,
                      })}{' '}
                      -{' '}
                      {format(filters.enrollDateTo, 'dd MMM yyyy', {
                        locale: dateLocale,
                      })}
                    </>
                  ) : filters.enrollDateFrom ? (
                    <>
                      {format(filters.enrollDateFrom, 'dd MMM yyyy', {
                        locale: dateLocale,
                      })}{' '}
                      - ...
                    </>
                  ) : filters.enrollDateTo ? (
                    <>
                      ... -{' '}
                      {format(filters.enrollDateTo, 'dd MMM yyyy', {
                        locale: dateLocale,
                      })}
                    </>
                  ) : (
                    <span>{t('select-date-range')}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="flex">
                  <div className="border-r p-2">
                    <p className="mb-2 text-center text-sm font-medium">
                      {t('enroll-date-from')}
                    </p>
                    <Calendar
                      mode="single"
                      selected={filters.enrollDateFrom}
                      onSelect={(date) =>
                        setFilters({ ...filters, enrollDateFrom: date })
                      }
                      initialFocus
                    />
                  </div>
                  <div className="p-2">
                    <p className="mb-2 text-center text-sm font-medium">
                      {t('enroll-date-to')}
                    </p>
                    <Calendar
                      mode="single"
                      selected={filters.enrollDateTo}
                      onSelect={(date) =>
                        setFilters({ ...filters, enrollDateTo: date })
                      }
                      disabled={(date) =>
                        filters.enrollDateFrom
                          ? date < filters.enrollDateFrom
                          : false
                      }
                    />
                  </div>
                </div>
                {(filters.enrollDateFrom || filters.enrollDateTo) && (
                  <div className="border-t p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() =>
                        setFilters({
                          ...filters,
                          enrollDateFrom: undefined,
                          enrollDateTo: undefined,
                        })
                      }
                    >
                      {t('clear-date')}
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>

          {/* Row 6: Graduated */}
          <div className="space-y-1">
            <Label className="text-xs">{t('graduated')}</Label>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between text-sm font-normal"
                >
                  <div className="flex flex-wrap gap-1">
                    {filters.graduated.length > 0 ? (
                      filters.graduated.map((val) => (
                        <span
                          key={val}
                          className="bg-muted rounded px-2 py-0.5 text-xs"
                        >
                          {graduatedOptions.find((o) => o.value === val)
                            ?.label ?? val}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted-foreground">
                        {t('graduated-placeholder')}
                      </span>
                    )}
                  </div>
                  <ChevronsUpDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command>
                  <CommandInput placeholder={t('search')} />
                  <CommandEmpty>{t('no-results')}</CommandEmpty>
                  <CommandGroup>
                    {graduatedOptions.map((option) => (
                      <CommandItem
                        key={option.value}
                        onSelect={() =>
                          setFilters({
                            ...filters,
                            graduated: toggleArrayValue(
                              filters.graduated,
                              option.value,
                            ),
                          })
                        }
                      >
                        <span>{option.label}</span>
                        <Check
                          className={cn(
                            'ml-auto h-4 w-4',
                            filters.graduated.includes(option.value)
                              ? 'opacity-100'
                              : 'opacity-0',
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t pt-4">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="mr-2 h-3 w-3" />
            {t('reset')}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              {t('cancel')}
            </Button>
            <Button size="sm" onClick={handleApply}>
              {t('apply')}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
