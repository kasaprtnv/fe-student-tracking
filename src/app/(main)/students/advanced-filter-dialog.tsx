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
import { useTranslations } from 'next-intl';
import { Filter, RotateCcw } from 'lucide-react';

export interface AdvancedFilterValues {
  code: string;
  fullName: string;
  email: string;
  phone: string;
  degree: string[];
  year: string[];
  courseId: string[];
  studyPlan: string[];
  enrollDateFrom: string;
  enrollDateTo: string;
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
  enrollDateFrom: '',
  enrollDateTo: '',
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

          {/* Row 5: Enroll Date Range */}
          <div className="space-y-1">
            <Label htmlFor="enrollDateFrom" className="text-xs">
              {t('enroll-date-from')}
            </Label>
            <Input
              id="enrollDateFrom"
              type="text"
              placeholder={t('date-format')}
              value={filters.enrollDateFrom}
              onChange={(e) =>
                setFilters({ ...filters, enrollDateFrom: e.target.value })
              }
              onFocus={(e) => (e.target.type = 'date')}
              onBlur={(e) => {
                if (!e.target.value) e.target.type = 'text';
              }}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="enrollDateTo" className="text-xs">
              {t('enroll-date-to')}
            </Label>
            <Input
              id="enrollDateTo"
              type="text"
              placeholder={t('date-format')}
              value={filters.enrollDateTo}
              onChange={(e) =>
                setFilters({ ...filters, enrollDateTo: e.target.value })
              }
              onFocus={(e) => (e.target.type = 'date')}
              onBlur={(e) => {
                if (!e.target.value) e.target.type = 'text';
              }}
              className="h-8 text-sm"
            />
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
