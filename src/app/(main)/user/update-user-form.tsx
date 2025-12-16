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
import { Loader } from 'lucide-react';
import { EnrollDateInput } from '@/components/enroll-date-input';
import { useTranslations } from 'next-intl';
import React from 'react';
import { useForm, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUser } from '@/hooks/use-user';
import { useCourse } from '@/hooks/use-course';
import { useCourseStaff } from '@/hooks/use-course_staff';
import { useSWRConfig } from 'swr';
import { toast } from 'sonner';
import { SelectOption } from '@/types';
import { User } from '@/types/user';
import { ICourseStaff } from '@/types/course-staff';
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
  allCourseStaff?: ICourseStaff[];
  onCourseStaffChange?: () => void;
}

export function UpdateUserFormDialog({
  open,
  onOpenChange,
  user,
  courseOptions,
  allCourseStaff = [],
  onCourseStaffChange,
}: UpdateUserFormDialogProps) {
  const t = useTranslations('user.user-form');
  const tCommon = useTranslations('common');
  const { updateExistingUser, storeAction, userMap } = useUser();
  const { fetchAllCourses, updateExistingCourse, getCourseById } = useCourse();
  const { mutate } = useSWRConfig();

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

  // Course staff management for teachers
  const { createNewCourseStaff, removeCourseStaff, fetchAllCourseStaff } =
    useCourseStaff();
  const [teacherCourseStaffList, setTeacherCourseStaffList] = React.useState<
    ICourseStaff[]
  >([]);

  const getDefaultValues = React.useCallback((): UserFormValues => {
    if (userRole === 'student') {
      return {
        role: 'student',
        title: user?.title || '',
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
        title: user?.title || '',
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        courseIds: [],
      };
    }
  }, [user, userRole]);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(updateUserSchema(t)) as Resolver<UserFormValues>,
    defaultValues: getDefaultValues(),
  });

  // Reset form when user changes
  React.useEffect(() => {
    if (user) {
      const newRole: UserRole =
        user.role === 'student' || user.role === 'teacher'
          ? user.role
          : 'student';
      setSelectedRole(newRole);
      form.reset(getDefaultValues());
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Set courseIds when dialog opens for teachers
  // Filter from allCourseStaff prop and set form values directly
  React.useEffect(() => {
    if (!open) return; // Only run when dialog is open

    if (user?.id && user?.role === 'teacher' && allCourseStaff.length > 0) {
      // Filter course_staff for this user from the prop
      const userCourseStaff = allCourseStaff.filter((cs) => {
        const csUserId = (cs as unknown as { userId: string }).userId;
        return csUserId === user.id;
      });

      // Only update if we have course staff data
      if (userCourseStaff.length > 0) {
        const courseIds = userCourseStaff.map((cs) => cs.courseId);
        setTeacherCourseStaffList(userCourseStaff);
        form.setValue('courseIds', courseIds);
      } else {
        // allCourseStaff is loaded but no courses for this user
        setTeacherCourseStaffList([]);
      }
    }
  }, [open, user?.id, allCourseStaff.length]); // eslint-disable-line react-hooks/exhaustive-deps

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

      // Handle course_staff update for teachers (multi-course support)
      if (formattedData.role === 'teacher' && formattedData.courseIds) {
        const newCourseIds = formattedData.courseIds as string[];
        const oldCourseIds = teacherCourseStaffList.map((cs) => cs.courseId);

        // Find courses to add (in new but not in old)
        const coursesToAdd = newCourseIds.filter(
          (id) => !oldCourseIds.includes(id),
        );
        // Find courses to remove (in old but not in new)
        const coursesToRemove = teacherCourseStaffList.filter(
          (cs) => !newCourseIds.includes(cs.courseId),
        );

        // Delete removed course_staff records and update course.staffIds
        for (const courseStaff of coursesToRemove) {
          await removeCourseStaff(courseStaff.id);
          // Update course to remove this user from staffIds
          const course = getCourseById(courseStaff.courseId);
          if (course) {
            const updatedStaffIds = (course.staffIds || []).filter(
              (id) => id !== user.id,
            );
            await updateExistingCourse(course.id, {
              staffIds: updatedStaffIds,
            });
          }
        }

        // Create new course_staff records and update course.staffIds
        for (const courseId of coursesToAdd) {
          await createNewCourseStaff({
            courseId,
            userId: user.id,
          } as unknown as { courseId: string; staffId: string });
          // Update course to add this user to staffIds
          const course = getCourseById(courseId);
          if (course) {
            const updatedStaffIds = [...(course.staffIds || []), user.id];
            await updateExistingCourse(course.id, {
              staffIds: updatedStaffIds,
            });
          }
        }

        // Remove courseId from user data since it's managed by course_staff
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { courseId: _courseId, ...teacherDataWithoutCourse } =
          formattedData;
        await updateExistingUser(
          user.id,
          teacherDataWithoutCourse as unknown as UpdateUserFormData,
        );
      } else {
        await updateExistingUser(
          user.id,
          formattedData as unknown as UpdateUserFormData,
        );
      }
      form.reset();
      onOpenChange(false);
      toast.success(t('toast.updated-successfully'));

      // Trigger refetch of course_staff data and courses (to update course page)
      onCourseStaffChange?.();
      fetchAllCourses();
      fetchAllCourseStaff();
      // Invalidate SWR cache for course page
      mutate('fetch-courses and-course-staff');
    } catch (error: unknown) {
      console.error('Error updating user:', error);

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
