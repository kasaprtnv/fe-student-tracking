'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { MultiSelect } from '@/components/ui/combobox-multi';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { useTranslations, useLocale } from 'next-intl';
import { Filter, RotateCcw, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { th, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';

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

  const form = useForm<AdvancedFilterValues>({
    defaultValues: currentFilters,
  });

  // Sync form when popover opens
  React.useEffect(() => {
    if (open) {
      form.reset(currentFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentFilters]);

  const enrollDateFrom = form.watch('enrollDateFrom');
  const enrollDateTo = form.watch('enrollDateTo');

  const handleApply = (data: AdvancedFilterValues) => {
    onApply(data);
    setOpen(false);
  };

  const handleReset = () => {
    form.reset(defaultFilterValues);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={isActive ? 'outline' : 'outline'}
          className={isActive ? 'bg-black text-white hover:bg-black/90 hover:text-white' : ''}
        >
          <Filter className="mr-2 h-4 w-4" />
          {t('filter-button')}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[600px] p-4" align="end">
        <div className="mb-4">
          <h4 className="font-semibold">{t('title')}</h4>
          <p className="text-muted-foreground text-sm">{t('description')}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleApply)}>
            <div className="grid grid-cols-2 gap-3">
              {/* Row 1: Code, Full Name */}
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">{t('code')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('code-placeholder')}
                        className="h-8 text-sm"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">{t('full-name')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('full-name-placeholder')}
                        className="h-8 text-sm"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Row 2: Email, Phone */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">{t('email')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('email-placeholder')}
                        className="h-8 text-sm"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">{t('phone')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('phone-placeholder')}
                        className="h-8 text-sm"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Row 3: Major, Degree */}
              <FormField
                control={form.control}
                name="major"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('major')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('major-placeholder')} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="degree"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">{t('degree')}</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={degreeOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t('degree-placeholder')}
                        maxDisplayItems={2}
                        enableEachCancel={false}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Row 4: Year, Course */}
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">{t('year')}</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={yearOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t('year-placeholder')}
                        maxDisplayItems={2}
                        enableEachCancel={false}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="courseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">{t('course')}</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={courseOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t('course-placeholder')}
                        maxDisplayItems={1}
                        enableEachCancel={false}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Row 5: Study Plan, Graduated */}
              <FormField
                control={form.control}
                name="studyPlan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">{t('study-plan')}</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={studyPlanOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t('study-plan-placeholder')}
                        maxDisplayItems={2}
                        enableEachCancel={false}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="graduated"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">{t('graduated')}</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={graduatedOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t('graduated-placeholder')}
                        maxDisplayItems={2}
                        enableEachCancel={false}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Row 6: Enroll Date Range */}
              <div className="space-y-1">
                <FormLabel className="text-xs">
                  {t('enroll-date-range')}
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        'border-input min-h-[38px] w-full justify-start px-3 py-2 text-left text-sm font-normal',
                        !enrollDateFrom &&
                          !enrollDateTo &&
                          'text-muted-foreground',
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {enrollDateFrom && enrollDateTo ? (
                        <>
                          {format(enrollDateFrom, 'dd MMM yyyy', {
                            locale: dateLocale,
                          })}{' '}
                          -{' '}
                          {format(enrollDateTo, 'dd MMM yyyy', {
                            locale: dateLocale,
                          })}
                        </>
                      ) : enrollDateFrom ? (
                        <>
                          {format(enrollDateFrom, 'dd MMM yyyy', {
                            locale: dateLocale,
                          })}{' '}
                          - ...
                        </>
                      ) : enrollDateTo ? (
                        <>
                          ... -{' '}
                          {format(enrollDateTo, 'dd MMM yyyy', {
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
                          selected={enrollDateFrom}
                          onSelect={(date) =>
                            form.setValue('enrollDateFrom', date)
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
                          selected={enrollDateTo}
                          onSelect={(date) =>
                            form.setValue('enrollDateTo', date)
                          }
                          disabled={(date) =>
                            enrollDateFrom ? date < enrollDateFrom : false
                          }
                        />
                      </div>
                    </div>
                    {(enrollDateFrom || enrollDateTo) && (
                      <div className="border-t p-2">
                        <Button
                          type="button"
                          variant="ghost"
                          className="w-full"
                          onClick={() => {
                            form.setValue('enrollDateFrom', undefined);
                            form.setValue('enrollDateTo', undefined);
                          }}
                        >
                          {t('clear-date')}
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <Button type="button" variant="outline" onClick={handleReset}>
                <RotateCcw className="mr-2 h-3 w-3" />
                {t('reset')}
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  {t('cancel')}
                </Button>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90"
                >
                  {t('apply')}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </PopoverContent>
    </Popover>
  );
}
