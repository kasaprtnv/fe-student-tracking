import { UserFormValues, UserRole } from '@/validations/user';
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
import { UseFormReturn } from 'react-hook-form';
import { useTranslations } from 'next-intl';

interface RoleSelectorProps {
  form: UseFormReturn<UserFormValues>;
  handleRoleChange: (role: UserRole) => void;
}

export const RoleSelector = ({ form, handleRoleChange }: RoleSelectorProps) => {
  const t = useTranslations('user.user-form');
  return (
    <FormField
      control={form.control}
      name="role"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium text-gray-700">
            {t('label.role')}
          </FormLabel>
          <Select
            onValueChange={(value: UserRole) => {
              field.onChange(value);
              handleRoleChange(value);
            }}
            value={field.value}
          >
            <FormControl>
              <SelectTrigger className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder={t('placeholder.role')} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="student">{t('role.student')}</SelectItem>
              <SelectItem value="teacher">{t('role.teacher')}</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
