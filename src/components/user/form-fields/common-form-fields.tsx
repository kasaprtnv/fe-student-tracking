import { UserFormValues } from '@/validations/user';
import { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { useTitle } from '@/hooks/use-title';
import React from 'react';

interface CommonFormFieldsProps {
  form: UseFormReturn<UserFormValues>;
}

export const CommonFormFields = ({ form }: CommonFormFieldsProps) => {
  const t = useTranslations('user.user-form');
  const { titleMap, allTitleId, fetchAllTitles } = useTitle();

  // Fetch titles on mount
  React.useEffect(() => {
    if (allTitleId.length === 0) {
      fetchAllTitles();
    }
  }, [allTitleId.length, fetchAllTitles]);

  return (
    <>
      <div className="grid grid-cols-2 items-start gap-4">
        <FormField
          control={form.control}
          name="titleId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                {t('label.title')}
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full border-gray-300 bg-white">
                    <SelectValue placeholder={t('placeholder.title')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {allTitleId.map((id) => {
                    const title = titleMap[id];
                    return (
                      <SelectItem key={id} value={id}>
                        {title?.name || id}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                {t('label.first-name')}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t('placeholder.first-name')}
                  className="border-gray-300 bg-white"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="lastName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">
              {t('label.last-name')}
            </FormLabel>
            <FormControl>
              <Input
                placeholder={t('placeholder.last-name')}
                className="border-gray-300 bg-white"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">
              {t('label.email')}
            </FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder={t('placeholder.email')}
                className="border-gray-300 bg-white"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Phone field */}
      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">
              {t('label.phone')}
            </FormLabel>
            <FormControl>
              <Input
                placeholder={t('placeholder.phone')}
                className="border-gray-300 bg-white"
                maxLength={10}
                {...field}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.value = target.value.replace(/\D/g, '');
                  field.onChange(target.value);
                }}
                onBlur={() => {
                  field.onBlur();
                  form.trigger('phone');
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
