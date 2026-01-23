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
import { MultiCombobox } from '@/components/ui/combobox/multiple-combobox';
import { Calendar } from '@/components/ui/calendar';
import { useTranslations } from 'next-intl';
import { Filter, RotateCcw, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { th, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useLocale } from 'next-intl';

export interface AdvancedFilterValues {
  code: string;
  fullName: string;
  email: string;
  phone: string;
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

          {/* Row 3: Degree, Year */}
          <div className="space-y-1">
            <Label className="text-xs">{t('degree')}</Label>
            <MultiCombobox
              options={degreeOptions}
              defaultValue={filters.degree}
              onChange={(values) => setFilters({ ...filters, degree: values })}
              placeholder={t('degree-placeholder')}
              placeholderSearch={t('search')}
              placeholderEmpty={t('no-results')}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{t('year')}</Label>
            <MultiCombobox
              options={yearOptions}
              defaultValue={filters.year}
              onChange={(values) => setFilters({ ...filters, year: values })}
              placeholder={t('year-placeholder')}
              placeholderSearch={t('search')}
              placeholderEmpty={t('no-results')}
            />
          </div>

          {/* Row 4: Course, Study Plan */}
          <div className="space-y-1">
            <Label className="text-xs">{t('course')}</Label>
            <MultiCombobox
              options={courseOptions}
              defaultValue={filters.courseId}
              onChange={(values) =>
                setFilters({ ...filters, courseId: values })
              }
              placeholder={t('course-placeholder')}
              placeholderSearch={t('search')}
              placeholderEmpty={t('no-results')}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{t('study-plan')}</Label>
            <MultiCombobox
              options={studyPlanOptions}
              defaultValue={filters.studyPlan}
              onChange={(values) =>
                setFilters({ ...filters, studyPlan: values })
              }
              placeholder={t('study-plan-placeholder')}
              placeholderSearch={t('search')}
              placeholderEmpty={t('no-results')}
            />
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
            <MultiCombobox
              options={graduatedOptions}
              defaultValue={filters.graduated}
              onChange={(values) =>
                setFilters({ ...filters, graduated: values })
              }
              placeholder={t('graduated-placeholder')}
              placeholderSearch={t('search')}
              placeholderEmpty={t('no-results')}
            />
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
