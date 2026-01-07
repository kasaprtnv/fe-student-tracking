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

interface TeacherFormFieldsProps {
  form: UseFormReturn<UserFormValues>;
  courseOptions: SelectOption[];
}

export const TeacherFormFields = ({
  form,
  courseOptions,
}: TeacherFormFieldsProps) => {
  const t = useTranslations('user.user-form');
  return (
    <>
      <FormField
        control={form.control}
        name="teacherDegree"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('label.teacher-degree')}</FormLabel>
            <FormControl>
              <Input {...field} placeholder={t('placeholder.teacher-degree')} />
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
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
