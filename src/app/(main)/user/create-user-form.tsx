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
import { MultiCombobox } from '@/components/ui/combobox/multiple-combobox';
import { EnrollDateInput } from '@/components/enroll-date-input';
import { Loader } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React from 'react';
import { useForm, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUser } from '@/hooks/use-user';
import { useCourseStaff } from '@/hooks/use-course_staff';
import { useCourse } from '@/hooks/use-course';
import { toast } from 'sonner';
import { SelectOption } from '@/types';
import {
  createUserSchema,
  CreateUserFormData,
  UserFormValues,
  UserRole,
} from '@/validations/user';

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
  const { createNewUser, storeAction, userMap } = useUser();
  const { createNewCourseStaff } = useCourseStaff();
  const { updateExistingCourse, getCourseById, fetchAllCourses } = useCourse();

  // Check if email already exists
  const isEmailExists = (email: string): boolean => {
    return Object.values(userMap).some(
      (user) => user.email?.toLowerCase() === email.toLowerCase(),
    );
  };

  const [selectedRole, setSelectedRole] = React.useState<UserRole>(defaultRole);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(createUserSchema(t)) as Resolver<UserFormValues>,
    defaultValues: {
      role: defaultRole,
      title: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      courseId: '',
      ...(defaultRole === 'student' && {
        code: '',
        degree: '',
        year: '',
        enrollDate: '',
      }),
    } as UserFormValues,
  });

  // Sync selectedRole and form when dialog opens or defaultRole changes
  React.useEffect(() => {
    if (open) {
      setSelectedRole(defaultRole);
      if (defaultRole === 'student') {
        form.reset({
          role: 'student',
          title: '',
          code: '',
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          degree: '',
          year: '',
          courseId: '',
          enrollDate: '',
        });
      } else {
        form.reset({
          role: 'teacher',
          title: '',
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          courseId: '',
        });
      }
    }
  }, [open, defaultRole, form]);

  // Handle role change
  const handleRoleChange = (newRole: UserRole) => {
    setSelectedRole(newRole);
    const currentValues = form.getValues();

    if (newRole === 'student') {
      form.reset({
        role: 'student',
        title: currentValues.title || '',
        code: '',
        firstName: currentValues.firstName || '',
        lastName: currentValues.lastName || '',
        email: currentValues.email || '',
        phone: currentValues.phone || '',
        degree: '',
        year: '',
        courseId: '',
        enrollDate: '',
      });
    } else {
      form.reset({
        role: 'teacher',
        title: currentValues.title || '',
        firstName: currentValues.firstName || '',
        lastName: currentValues.lastName || '',
        email: currentValues.email || '',
        courseId: '',
        phone: currentValues.phone || '',
      });
    }
  };

  const onSubmit = async (data: UserFormValues) => {
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
      console.log('Submitting Create User Data:', formattedData);
      const result = await createNewUser(
        formattedData as unknown as CreateUserFormData,
      );

      // If teacher with courseIds, create course_staff records
      if (
        formattedData.role === 'teacher' &&
        formattedData.courseIds &&
        result?.receivedData?.id
      ) {
        const newUserId = result.receivedData.id;
        const courseIds = formattedData.courseIds as string[];
        for (const courseId of courseIds) {
          await createNewCourseStaff({
            courseId,
            userId: newUserId,
          } as unknown as { courseId: string; staffId: string });

          // Update course.staffIds
          const course = getCourseById(courseId);
          if (course) {
            const updatedStaffIds = [...(course.staffIds || []), newUserId];
            await updateExistingCourse(course.id, {
              staffIds: updatedStaffIds,
            });
          }
        }
        // Refetch courses to update UI
        fetchAllCourses();
      }

      form.reset();
      setSelectedRole(defaultRole);
      onOpenChange(false);
      toast.success(t('toast.created-successfully'));
    } catch (error: unknown) {
      console.error('Error creating user:', error);

      // Check if it's a Supabase email already exists error
      const errorMessage =
        error instanceof Error ? error.message : String(error);
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
        toast.error(t('toast.creation-failed'));
      }
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
      <DialogContent className="flex h-[600px] flex-col gap-6 bg-gray-50 shadow-lg sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">
            {t('header.create')}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            {t('header_description.create')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4"
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

            {/* Title field */}
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

            {/* Teacher-specific field: courseIds (multiple courses) */}
            {selectedRole === 'teacher' && (
              <FormField
                control={form.control}
                name="courseIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      {t('label.course')}
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
                          <SelectItem value="ปริญญาโท">
                            {t('education-level.masters')}
                          </SelectItem>
                          <SelectItem value="ปริญญาเอก">
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
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                              <SelectValue
                                placeholder={t('placeholder.year')}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {years.map((year) => (
                              <SelectItem key={year} value={year}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
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
