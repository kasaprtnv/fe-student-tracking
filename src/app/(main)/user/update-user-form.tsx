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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Form, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Loader } from 'lucide-react';
import { CommonFormFields } from '@/components/user/form-fields/common-form-fields';
import { StudentFormFields } from '@/components/user/form-fields/student-form-fields';
import { TeacherFormFields } from '@/components/user/form-fields/teacher-form-fields';
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
  // UpdateUserFormData,
  UserFormValues,
  UserRole,
} from '@/validations/user';
import { ICourse } from '@/types/course';

interface UpdateUserFormDialogProps {
  open: boolean;
  user: User | undefined;
  courseOptions: SelectOption[];
  allCourses: ICourse[];
  allCourseStaff?: ICourseStaff[];
  onOpenChange: (open: boolean) => void;
  onCourseStaffChange?: () => void;
}

export function UpdateUserFormDialog({
  open,
  onOpenChange,
  user,
  courseOptions,
  allCourseStaff = [],
  allCourses,
  onCourseStaffChange,
}: UpdateUserFormDialogProps) {
  const tForm = useTranslations('user.user-form');
  const tUser = useTranslations('user');
  const tCommon = useTranslations('common');
  const { updateExistingUser, storeAction, userMap, getStudentProgressCount } =
    useUser();
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

  // Confirmation dialog state
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
  const [pendingFormData, setPendingFormData] =
    React.useState<UserFormValues | null>(null);
  const [progressCount, setProgressCount] = React.useState(0);

  const getDefaultValues = React.useCallback((): UserFormValues => {
    if (userRole === 'student') {
      return {
        role: 'student',
        titleId: user?.titleId || '',
        code: user?.code || '',
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        degree: user?.degree || '',
        year: user?.year || '',
        studyPlan: user?.studyPlan
          ? user.studyPlan.startsWith('แผน')
            ? user.studyPlan
            : `แผน ${user.studyPlan}`
          : '',
        courseId: user?.courseId || '',
        enrollDate: user?.enrollDate || '',
        isActive: user?.isActive ?? true,
      };
    } else {
      return {
        role: 'teacher',
        titleId: user?.titleId || '',
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        teacherDegree: user?.teacherDegree || '',
        academicPosition: user?.academicPosition || '',
        courseIds: [],
        isActive: user?.isActive ?? true,
      };
    }
  }, [user, userRole]);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(updateUserSchema(tForm)) as Resolver<UserFormValues>,
    defaultValues: getDefaultValues(),
  });

  // Reset form when user changes or dialog opens
  React.useEffect(() => {
    if (user && open) {
      const newRole: UserRole =
        user.role === 'student' || user.role === 'teacher'
          ? user.role
          : 'student';
      setSelectedRole(newRole);
      form.reset(getDefaultValues());
    }
  }, [user, open, form, getDefaultValues]); // Reset whenever user changes or dialog re-opens

  // Set courseIds when dialog opens for teachers
  // Filter from allCourseStaff prop and set form values directly
  React.useEffect(() => {
    if (!open) return; // Only run when dialog is open

    if (user?.id && user?.role === 'teacher' && allCourseStaff.length > 0) {
      // Filter course_staff for this user from the prop
      const userCourseStaff = allCourseStaff.filter((cs) => {
        return cs.userId === user.id;
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
        message: tForm('errors.email-exists'),
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
          });
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
        await updateExistingUser(user.id, teacherDataWithoutCourse);
      } else {
        // For students, check if courseId changed and if they have progress
        if (
          user.role === 'student' &&
          formattedData.courseId &&
          formattedData.courseId !== user.courseId
        ) {
          try {
            const count = await getStudentProgressCount(user.id);
            if (count > 0) {
              // Open confirmation dialog instead of window.confirm
              setProgressCount(count);
              setPendingFormData(formattedData);
              setConfirmDialogOpen(true);
              return; // Stop here, wait for confirmation
            }
          } catch (error) {
            console.error('Error checking progress count:', error);
          }
        }

        await updateExistingUser(user.id, formattedData);
      }
      form.reset();
      onOpenChange(false);
      toast.success(tForm('toast.updated-successfully'));

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
          message: tForm('errors.email-exists'),
        });
        toast.error(tForm('errors.email-exists'));
      } else {
        toast.error(tForm('toast.update-failed'));
      }
    }
  };

  const handleConfirmUpdate = async () => {
    if (!pendingFormData) return;

    try {
      await updateExistingUser(user!.id, pendingFormData);
      form.reset();
      onOpenChange(false);
      setConfirmDialogOpen(false);
      setPendingFormData(null);
      toast.success(tForm('toast.updated-successfully'));

      // Trigger refetch
      onCourseStaffChange?.();
      fetchAllCourses();
      fetchAllCourseStaff();
      mutate('fetch-courses and-course-staff');
    } catch (error: unknown) {
      console.error('Error updating user:', error);
      toast.error(tForm('toast.update-failed'));
    }
  };

  return (
    <>
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tCommon('confirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              {tUser('dialog.confirm_course_change_with_progress', {
                count: progressCount,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setConfirmDialogOpen(false);
                setPendingFormData(null);
              }}
            >
              {tCommon('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmUpdate}>
              {tCommon('confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex h-[600px] flex-col gap-6 bg-gray-50 shadow-lg sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800">
              {tForm('header.edit')}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              {tForm('header_description.edit')}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4"
            >
              <CommonFormFields form={form} disabledFields={['email']} />
              {selectedRole === 'student' && (
                <StudentFormFields
                  form={form}
                  allCourses={allCourses}
                  disabledFields={[
                    'code',
                    'courseId',
                    'degree',
                    'year',
                    'enrollDate',
                  ]}
                />
              )}
              {selectedRole === 'teacher' && (
                <TeacherFormFields form={form} courseOptions={courseOptions} />
              )}

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-md border border-gray-300 bg-white p-3 shadow-xs">
                    <FormLabel
                      htmlFor="isActive"
                      className="mb-0 cursor-pointer text-sm font-medium text-gray-700"
                    >
                      {tForm('label.is-active')}
                    </FormLabel>
                    <Switch
                      id="isActive"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormItem>
                )}
              />
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
    </>
  );
}
