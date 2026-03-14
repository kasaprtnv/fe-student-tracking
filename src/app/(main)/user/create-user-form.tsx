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
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React from 'react';
import { useForm, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUser } from '@/hooks/use-user';
import { useCourseStaff } from '@/hooks/use-course_staff';
import { toast } from 'sonner';
import { SelectOption } from '@/types';
import { ICourse } from '@/types/course';
import { RoleSelector } from '../../../components/user/form-fields/role-selector';
import { StudentFormFields } from '../../../components/user/form-fields/student-form-fields';
import { CommonFormFields } from '../../../components/user/form-fields/common-form-fields';
import {
  createUserSchema,
  CreateUserFormData,
  UserFormValues,
  UserRole,
} from '@/validations/user';
import { TeacherFormFields } from '@/components/user/form-fields/teacher-form-fields';
import { userService } from '@/services/user.service';

interface CreateUserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseOptions: SelectOption[];
  allCourses: ICourse[];
  defaultRole?: UserRole;
  onUserCreated?: () => void;
}

export function CreateUserFormDialog({
  open,
  onOpenChange,
  courseOptions,
  allCourses,
  defaultRole = 'student',
  onUserCreated,
}: CreateUserFormDialogProps) {
  const t = useTranslations('user.user-form');
  const tCommon = useTranslations('common');
  const { createNewUser, storeAction } = useUser();
  const { createNewCourseStaff } = useCourseStaff();

  // Check if email already exists (calls backend to check all users including inactive)
  const isEmailExists = async (email: string): Promise<boolean> => {
    try {
      const result = await userService.checkEmailExists(email);
      return result.exists;
    } catch {
      return false;
    }
  };

  // Check if student code already exists
  const isCodeExists = async (code: string): Promise<boolean> => {
    try {
      const result = await userService.checkCodeExists(code);
      return result.exists;
    } catch {
      return false;
    }
  };

  const [selectedRole, setSelectedRole] = React.useState<UserRole>(defaultRole);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(createUserSchema(t)) as Resolver<UserFormValues>,
    defaultValues: {
      role: defaultRole,
      titleId: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      courseId: '',
      ...(defaultRole === 'student' && {
        code: '',
        degree: '',
        year: '',
        studyPlan: '',
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
          titleId: '',
          code: '',
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          degree: '',
          major: '',
          year: '',
          studyPlan: '',
          courseId: '',
          enrollDate: '',
        });
      } else {
        form.reset({
          role: 'teacher',
          titleId: '',
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          major: '',
          teacherDegree: '',
          academicPosition: '',
          courseId: '',
        });
      }
    }
  }, [open, defaultRole, form]);

  // Handle role change
  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    const currentValues = form.getValues();

    if (role === 'student') {
      form.reset({
        role: 'student',
        titleId: currentValues.titleId || '',
        code: '',
        firstName: currentValues.firstName || '',
        lastName: currentValues.lastName || '',
        email: currentValues.email || '',
        phone: currentValues.phone || '',
        degree: '',
        major: '',
        year: '',
        studyPlan: '',
        courseId: '',
        enrollDate: '',
      });
    } else {
      form.reset({
        role: 'teacher',
        titleId: currentValues.titleId || '',
        firstName: currentValues.firstName || '',
        lastName: currentValues.lastName || '',
        email: currentValues.email || '',
        courseId: '',
        phone: currentValues.phone || '',
        major: '',
      });
    }
  };

  const checkDuplicates = async (data: UserFormValues): Promise<boolean> => {
    const [emailExists, codeExists] = await Promise.all([
      isEmailExists(data.email),
      data.role === 'student' && 'code' in data && data.code
        ? isCodeExists(data.code as string)
        : Promise.resolve(false),
    ]);

    let hasError = false;
    if (emailExists) {
      form.setError('email', {
        type: 'manual',
        message: t('errors.email-exists'),
      });
      hasError = true;
    }
    if (codeExists) {
      form.setError('code', {
        type: 'manual',
        message: t('errors.code-exists'),
      });
      hasError = true;
    }
    return hasError;
  };

  const onSubmit = async (data: UserFormValues) => {
    const hasError = await checkDuplicates(data);
    if (hasError) return;

    const formattedData = { ...data };

    try {
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
          });
        }
      }

      form.reset();
      setSelectedRole(defaultRole);
      onOpenChange(false);
      toast.success(t('toast.created-successfully'));
      onUserCreated?.();
    } catch (error: unknown) {
      console.error('Error creating user:', error);

      // Check if it's a Supabase email already exists error
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (
        errorMessage.includes('email address has already been registered') ||
        (errorMessage.includes('already exists') &&
          !errorMessage.includes('Code'))
      ) {
        form.setError('email', {
          type: 'manual',
          message: t('errors.email-exists'),
        });
        toast.error(t('errors.email-exists'));
      } else if (
        errorMessage.includes('Code') &&
        errorMessage.includes('already exists')
      ) {
        form.setError('code', {
          type: 'manual',
          message: t('errors.code-exists'),
        });
        toast.error(t('errors.code-exists'));
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
            onSubmit={form.handleSubmit(onSubmit, (_, e) => {
              const currentValues = form.getValues();
              checkDuplicates(currentValues);
              e?.preventDefault();
            })}
            className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4"
          >
            <RoleSelector form={form} handleRoleChange={handleRoleChange} />
            <CommonFormFields form={form} emailCheckFn={isEmailExists} />
            {selectedRole === 'student' && (
              <StudentFormFields
                form={form}
                allCourses={allCourses}
                codeCheckFn={isCodeExists}
              />
            )}
            {selectedRole === 'teacher' && (
              <TeacherFormFields form={form} courseOptions={courseOptions} />
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
