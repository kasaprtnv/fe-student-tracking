'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';
import { EnrollDateInput } from '@/components/enroll-date-input';
import { useTranslations } from 'next-intl';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUser } from '@/hooks/use-user';
import { toast } from 'sonner';
import { SelectOption } from '@/types';
import { User } from '@/types/user';
import {
  updateUserSchema,
  UpdateUserFormData,
  UserFormValues,
  UserRole,
} from '@/validations/user';

interface UpdateUserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | undefined;
  courseOptions: SelectOption[];
}

export function UpdateUserFormDialog({
  open,
  onOpenChange,
  user,
  courseOptions,
}: UpdateUserFormDialogProps) {
  const t = useTranslations('user.user-form');
  const tCommon = useTranslations('common');
  const { updateExistingUser, storeAction, userMap } = useUser();

  // Check if email already exists (excluding current user)
  const isEmailExists = (email: string): boolean => {
    return Object.values(userMap).some(
      (u) =>
        u.email?.toLowerCase() === email.toLowerCase() && u.id !== user?.id,
    );
  };

  const userRole: UserRole =
    user?.role === 'student' || user?.role === 'teacher'
      ? user.role
      : 'student';

  const [selectedRole, setSelectedRole] = React.useState<UserRole>(userRole);

  const getDefaultValues = React.useCallback((): UserFormValues => {
    if (userRole === 'student') {
      return {
        role: 'student',
        code: user?.code || '',
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        degree: user?.degree || '',
        year: user?.year || '',
        courseId: user?.courseId || '',
        enrollDate: user?.enrollDate || '',
      };
    } else {
      return {
        role: 'teacher',
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        courseId: user?.courseId || '',
      };
    }
  }, [user, userRole]);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(updateUserSchema(t)) as any,
    defaultValues: getDefaultValues(),
  });

  // Reset form when user changes or dialog opens
  React.useEffect(() => {
    if (user) {
      const newRole: UserRole =
        user.role === 'student' || user.role === 'teacher'
          ? user.role
          : 'student';
      setSelectedRole(newRole);
      form.reset(getDefaultValues());
    }
  }, [user, form, getDefaultValues]);

  const onSubmit = async (data: UserFormValues) => {
    if (!user?.id) return;

    // Check if email already exists
    if (isEmailExists(data.email)) {
      form.setError('email', {
        type: 'manual',
        message: t('errors.email-exists'),
      });
      return;
    }

    const formattedData = { ...data };
    if (formattedData.role === 'student' && formattedData.enrollDate === '') {
      formattedData.enrollDate = undefined;
    }

    try {
      console.log('Submitting Update User Data:', formattedData);
      await updateExistingUser(
        user.id,
        formattedData as unknown as UpdateUserFormData,
      );
      form.reset();
      onOpenChange(false);
      toast.success(t('toast.updated-successfully'));
    } catch (error: any) {
      console.error('Error updating user:', error);

      // Check if it's a Supabase email already exists error
      const errorMessage = error?.message || '';
      if (
        errorMessage.includes('email address has already been registered') ||
        errorMessage.includes('User already registered') ||
        errorMessage.includes('already exists')
      ) {
        form.setError('email', {
          type: 'manual',
          message: t('errors.email-exists'),
        });
        toast.error(t('errors.email-exists'));
      } else {
        toast.error(t('toast.update-failed'));
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[600px] flex-col gap-6 bg-gray-50 shadow-lg sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">
            {t('header.edit')}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            {t('header_description.edit')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4"
          >
            {/* Student-specific fields: code, courseId */}
            {selectedRole === 'student' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          {t('label.code')}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('placeholder.code')}
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
                    name="courseId"
                    render={({ field }) => (
                      <FormItem className="min-w-0">
                        <FormLabel className="text-sm font-medium text-gray-700">
                          {t('label.course')}
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full truncate border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                              <SelectValue
                                placeholder={t('placeholder.course')}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {courseOptions.map((course) => (
                              <SelectItem
                                key={course.value}
                                value={course.value}
                              >
                                {course.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            {/* Common fields: firstName, lastName */}
            <div className="grid grid-cols-2 gap-4">
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
            </div>

            {/* Email field */}
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
                      disabled
                      placeholder={t('placeholder.email')}
                      className="border-gray-300 bg-gray-100 focus:border-blue-500 focus:ring-blue-500"
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
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Teacher-specific field: courseId */}
            {selectedRole === 'teacher' && (
              <FormField
                control={form.control}
                name="courseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      {t('label.course')}
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder={t('placeholder.course')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {courseOptions.map((course) => (
                          <SelectItem key={course.value} value={course.value}>
                            {course.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Student-specific fields: degree, year */}
            {selectedRole === 'student' && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="degree"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        {t('label.degree')}
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue
                              placeholder={t('placeholder.degree')}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="masters">
                            {t('education-level.masters')}
                          </SelectItem>
                          <SelectItem value="doctoral">
                            {t('education-level.doctoral')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        {t('label.year')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('placeholder.year')}
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Student-specific field: enrollDate */}
            {selectedRole === 'student' && (
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
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Spacer to push footer to bottom */}
            <div className="flex-1" />

            <DialogFooter className="px-0">
              <div className="flex flex-1 justify-end space-x-2">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    {tCommon('cancel')}
                  </Button>
                </DialogClose>
                <Button disabled={storeAction === 'updating'} type="submit">
                  {storeAction === 'updating' && (
                    <Loader
                      className="mr-2 size-4 animate-spin"
                      aria-hidden="true"
                    />
                  )}
                  {tCommon('save')}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
