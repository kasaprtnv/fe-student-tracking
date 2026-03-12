import { SelectOption } from '@/types';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { UserFormValues } from '@/validations/user';
import { useTranslations } from 'next-intl';
import { MultiCombobox } from '@/components/ui/combobox/multiple-combobox';

import { Input } from '@/components/ui/input';
import { DynamicInputList } from '@/components/ui/dynamic-input-list';

interface TeacherFormFieldsProps {
  form: UseFormReturn<UserFormValues>;
  courseOptions: SelectOption[];
  disabledFields?: string[];
}

export const TeacherFormFields = ({
  form,
  courseOptions,
  disabledFields = [],
}: TeacherFormFieldsProps) => {
  const t = useTranslations('user.user-form');
  return (
    <>
      <FormField
        control={form.control}
        name="major"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">
              {t('label.major')}
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder={t('placeholder.major')}
                disabled={disabledFields.includes('major')}
                onBlur={() => {
                  field.onChange(field.value?.trim() ?? '');
                  field.onBlur();
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="teacherDegree"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">
              {t('label.teacher-degree')}
            </FormLabel>
            <FormControl>
              <DynamicInputList
                value={field.value}
                onChange={field.onChange}
                placeholder={t('placeholder.teacher-degree')}
                buttonLabel={t('label.add-teacher-degree')}
                disabled={disabledFields.includes('teacherDegree')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="academicPosition"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">
              {t('label.academic-position')}
            </FormLabel>
            <FormControl>
              <DynamicInputList
                value={field.value}
                onChange={field.onChange}
                placeholder={t('placeholder.academic-position')}
                buttonLabel={t('label.add-academic-position')}
                disabled={disabledFields.includes('academicPosition')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="courseIds"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">
              {t('label.teacher-course')}
            </FormLabel>
            <FormControl>
              <MultiCombobox
                defaultValue={field.value || []}
                placeholder={t('placeholder.course')}
                placeholderSearch={t('placeholder.course')}
                placeholderEmpty={t('placeholder.course')}
                options={courseOptions}
                onChange={field.onChange}
                disabled={disabledFields.includes('courseIds')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
