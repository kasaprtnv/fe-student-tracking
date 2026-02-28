import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ICourse } from '@/types/course';
import { UserFormValues } from '@/validations/user';
import { useTranslations } from 'next-intl';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '../../ui/input';
import { SingleCombobox } from '../../ui/combobox-single';
import { DegreesCombobox } from '../../degree-combobox';
import { EnrollDateInput } from '../../enroll-date-input';
import { useMemo } from 'react';

interface StudentFormFieldsProps {
  form: UseFormReturn<UserFormValues>;
  allCourses: ICourse[];
  disabledFields?: string[];
}

export const StudentFormFields = ({
  form,
  allCourses,
  disabledFields = [],
}: StudentFormFieldsProps) => {
  const t = useTranslations('user.user-form');

  // Watch degree to filter courses and disable courseId if not selected
  const selectedDegree = form.watch('degree');

  // Filter courses by selected degree
  const filteredCourseOptions = useMemo(() => {
    if (!selectedDegree) return [];
    return allCourses
      .filter((course) => course.degree === selectedDegree)
      .map((course) => ({
        label: `${course.code} - ${course.name}`,
        value: course.id,
      }));
  }, [allCourses, selectedDegree]);

  return (
    <>
      <FormField
        control={form.control}
        name="code"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">
              {t('label.student-code')}
            </FormLabel>
            <FormControl>
              <Input
                placeholder={t('placeholder.student-code')}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                maxLength={8}
                disabled={disabledFields.includes('code')}
                {...field}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.value = target.value.replace(/\D/g, '');
                  field.onChange(target.value);
                }}
                onBlur={() => {
                  field.onBlur();
                  form.trigger('code');
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {/* Degree must come BEFORE courseId so user selects degree first */}
      <FormField
        control={form.control}
        name="degree"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">
              {t('label.degree')}
            </FormLabel>
            <DegreesCombobox
              defaultValue={field.value || ''}
              disabled={disabledFields.includes('degree')}
              onChange={(value) => {
                field.onChange(value);
                // Reset courseId when degree changes
                form.setValue('courseId', '');
              }}
            />
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="courseId"
        render={({ field }) => (
          <FormItem className="min-w-0">
            <FormLabel className="text-sm font-medium text-gray-700">
              {t('label.student-course')}
            </FormLabel>
            <FormControl>
              <SingleCombobox
                placeholder={
                  !selectedDegree
                    ? t('placeholder.select-degree-first')
                    : t('placeholder.course')
                }
                placeholderSearch={t('placeholder.search-course')}
                placeholderEmpty={t('placeholder.no-course-found')}
                options={filteredCourseOptions}
                defaultValue={field.value || ''}
                disabled={
                  disabledFields.includes('courseId') || !selectedDegree
                }
                onChange={(value) => field.onChange(value)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="year"
        render={({ field }) => {
          // Generate years from current year back 5 years (in Buddhist Era)
          const currentYear = new Date().getFullYear() + 543;
          const years = Array.from({ length: 5 }, (_, i) =>
            (currentYear - i).toString(),
          );

          return (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                {t('label.year')}
              </FormLabel>
              <SingleCombobox
                disabled={disabledFields.includes('year')}
                placeholder={t('placeholder.year')}
                placeholderSearch={t('placeholder.search-year')}
                placeholderEmpty={t('placeholder.no-year-found')}
                options={years.map((year) => ({ label: year, value: year }))}
                defaultValue={field.value || ''}
                onChange={(value) => field.onChange(value)}
              />
              <FormMessage />
            </FormItem>
          );
        }}
      />
      <FormField
        control={form.control}
        name="studyPlan"
        render={({ field }) => {
          const studyPlanOptions = [
            { label: t('study-plan-options.plan-a'), value: 'แผน ก' },
            { label: t('study-plan-options.plan-b'), value: 'แผน ข' },
          ];

          return (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                {t('label.study-plan')}
              </FormLabel>
              <FormControl>
                <SingleCombobox
                  disabled={disabledFields.includes('studyPlan')}
                  placeholder={t('placeholder.study-plan')}
                  placeholderSearch={t('placeholder.search-study-plan')}
                  placeholderEmpty={t('placeholder.no-study-plan-found')}
                  options={studyPlanOptions}
                  defaultValue={field.value || ''}
                  onChange={(value) => field.onChange(value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />
      <FormField
        control={form.control}
        name="enrollDate"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel className="text-sm font-medium text-gray-700">
              {t('label.enroll-date')}
            </FormLabel>
            <div className="relative">
              <EnrollDateInput
                disabled={disabledFields.includes('enrollDate')}
                value={field.value}
                onChange={(val) => {
                  field.onChange(val);
                  // Force validation trigger to clear error immediately after selection
                  if (val) form.trigger('enrollDate');
                }}
                onBlur={() => {
                  field.onBlur();
                  form.trigger('enrollDate');
                }}
              />
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
