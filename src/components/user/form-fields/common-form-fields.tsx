import { UserFormValues } from '@/validations/user';
import { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';

interface CommonFormFieldsProps {
  form: UseFormReturn<UserFormValues>;
}

export const CommonFormFields = ({ form }: CommonFormFieldsProps) => {
  const t = useTranslations('user.user-form');
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                {t('label.title')}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t('placeholder.title')}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  {...field}
                />
              </FormControl>
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
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                maxLength={10}
                {...field}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.value = target.value.replace(/\D/g, '');
                  field.onChange(target.value);
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
