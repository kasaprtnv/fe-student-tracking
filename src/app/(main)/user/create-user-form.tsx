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
import { useTranslations } from 'next-intl';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUser } from '@/hooks/use-user';
import { toast } from 'sonner';
import { SelectOption } from '@/types';

type UserRole = 'student' | 'teacher';

// Base schema for common fields
const baseSchema = (t: (key: string) => string) =>
  z.object({
    role: z.enum(['student', 'teacher']),
    firstName: z
      .string()
      .min(1, t('errors.first-name-required'))
      .min(2, t('errors.first-name-min'))
      .max(50, t('errors.first-name-max')),
    lastName: z
      .string()
      .min(1, t('errors.last-name-required'))
      .min(2, t('errors.last-name-min'))
      .max(50, t('errors.last-name-max')),
    email: z.string().email(t('errors.email-invalid')),
    phone: z
      .string()
      .max(20, t('errors.phone-max'))
      .optional()
      .or(z.literal('')),
  });

// Student-specific schema
const studentSchema = (t: (key: string) => string) =>
  baseSchema(t).extend({
    role: z.literal('student'),
    code: z.string().min(1, t('errors.code-required')),
    degree: z
      .string()
      .max(100, t('errors.degree-max'))
      .optional()
      .or(z.literal('')),
    year: z.string().max(10, t('errors.year-max')).optional().or(z.literal('')),
    courseId: z.string().min(1, t('errors.course-required')),
  });

// Teacher-specific schema
const teacherSchema = (t: (key: string) => string) =>
  baseSchema(t).extend({
    role: z.literal('teacher'),
  });

// Combined schema using discriminated union
const createUserSchema = (t: (key: string) => string) =>
  z.discriminatedUnion('role', [studentSchema(t), teacherSchema(t)]);

type CreateUserFormData = z.infer<ReturnType<typeof createUserSchema>>;

interface CreateUserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseOptions: SelectOption[];
  defaultRole?: UserRole;
}

export function CreateUserFormDialog({
  open,
  onOpenChange,
  courseOptions,
  defaultRole = 'student',
}: CreateUserFormDialogProps) {
  const t = useTranslations('user.user-form');
  const tCommon = useTranslations('common');
  const { createNewUser, storeAction } = useUser();

  const [selectedRole, setSelectedRole] = React.useState<UserRole>(defaultRole);

  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema(t)),
    defaultValues: {
      role: defaultRole,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      ...(defaultRole === 'student' && {
        code: '',
        degree: '',
        year: '',
        courseId: '',
      }),
    } as CreateUserFormData,
  });

  // Handle role change
  const handleRoleChange = (newRole: UserRole) => {
    setSelectedRole(newRole);
    const currentValues = form.getValues();

    if (newRole === 'student') {
      form.reset({
        role: 'student',
        code: '',
        firstName: currentValues.firstName || '',
        lastName: currentValues.lastName || '',
        email: currentValues.email || '',
        phone: currentValues.phone || '',
        degree: '',
        year: '',
        courseId: '',
      });
    } else {
      form.reset({
        role: 'teacher',
        firstName: currentValues.firstName || '',
        lastName: currentValues.lastName || '',
        email: currentValues.email || '',
        phone: currentValues.phone || '',
      });
    }
  };

  const onSubmit = async (data: CreateUserFormData) => {
    try {
      await createNewUser(data);
      form.reset();
      setSelectedRole(defaultRole);
      onOpenChange(false);
      toast.success(t('toast.created-successfully'));
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(t('toast.creation-failed'));
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
      setSelectedRole(defaultRole);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-6 bg-gray-50 shadow-lg sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">
            {selectedRole === 'student'
              ? t('header.create-student')
              : t('header.create-teacher')}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            {selectedRole === 'student'
              ? t('header_description.create-student')
              : t('header_description.create-teacher')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-1 flex-col gap-4 overflow-y-auto px-4"
          >
            {/* Role Selector */}
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
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder={t('placeholder.role')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="student">
                        {t('role.student')}
                      </SelectItem>
                      <SelectItem value="teacher">
                        {t('role.teacher')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          {t('label.course')}
                          <span className="text-destructive"> *</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
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
                      {selectedRole === 'teacher' && (
                        <span className="text-destructive"> *</span>
                      )}
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
                      {selectedRole === 'teacher' && (
                        <span className="text-destructive"> *</span>
                      )}
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
                    <span className="text-destructive"> *</span>
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
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      <FormControl>
                        <Input
                          placeholder={t('placeholder.degree')}
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
                <Button disabled={storeAction === 'creating'} type="submit">
                  {storeAction === 'creating' && (
                    <Loader
                      className="mr-2 size-4 animate-spin"
                      aria-hidden="true"
                    />
                  )}
                  {tCommon('submit')}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
