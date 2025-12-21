'use client';

import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader } from 'lucide-react';
import { User } from '@/types/user';
import { useCourse } from '@/hooks/use-course';
import {
  createUserSchema,
  updateUserSchema,
  CreateUserFormData,
  UpdateUserFormData,
} from '@/validations/user';

interface UserFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<User>) => Promise<void>;
  user: User | null;
  isLoading: boolean;
  mode: 'create' | 'edit';
}

const UserFormDialog = ({
  open,
  onClose,
  onSubmit,
  user,
  isLoading,
  mode,
}: UserFormDialogProps) => {
  const t = useTranslations('user');
  const tCommon = useTranslations('common');

  // Fetch courses for dropdown
  const { courseMap, allCourseId, fetchAllCourses } = useCourse();
  const courses = allCourseId.map((id) => courseMap[id]).filter(Boolean);

  // Fetch courses on mount
  React.useEffect(() => {
    fetchAllCourses();
  }, [fetchAllCourses]);

  // Use different schema based on mode
  const schema = mode === 'create' ? createUserSchema(t) : updateUserSchema(t);

  const form = useForm<CreateUserFormData | UpdateUserFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      degree: '',
      year: '',
      role: 'student',
      courseId: '',
    },
  });

  // Watch role to conditionally show courseId field
  const watchedRole = useWatch({
    control: form.control,
    name: 'role',
  });

  // Reset form when user changes or mode changes
  React.useEffect(() => {
    if (user && open && mode === 'edit') {
      const validRole: 'student' | 'teacher' =
        user.role === 'student' || user.role === 'teacher'
          ? user.role
          : 'student';
      form.reset({
        code: user.code || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        degree: user.degree || '',
        year: user.year || '',
        role: validRole,
        courseId: user.courseId || '',
        enrollDate: user.enrollDate || '',
      } as CreateUserFormData | UpdateUserFormData);
    } else if (!user && open && mode === 'create') {
      form.reset({
        code: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        degree: '',
        year: '',
        role: 'student',
        courseId: '',
      });
    }
  }, [user, open, form, mode]);

  const handleSubmit = async (
    data: CreateUserFormData | UpdateUserFormData,
  ) => {
    await onSubmit(data);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? t('edit-user') : t('add-user')}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('code')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('code-placeholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('role')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('select-role')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="student">{t('student')}</SelectItem>
                        <SelectItem value="teacher">{t('teacher')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('first-name')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('first-name-placeholder')}
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
                    <FormLabel>{t('last-name')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('last-name-placeholder')}
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('email')}
                    {mode === 'create' && (
                      <span className="text-destructive"> *</span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t('email-placeholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('phone')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('phone-placeholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="degree"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('degree')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('degree-placeholder')} {...field} />
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
                    <FormLabel>{t('year')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('year-placeholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Course ID - required for students and teachers */}
            {(watchedRole === 'student' || watchedRole === 'teacher') && (
              <FormField
                control={form.control}
                name="courseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('course')}
                      <span className="text-destructive"> *</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('course-placeholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.code} - {course.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                {tCommon('cancel')}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && (
                  <Loader
                    className="mr-2 size-4 animate-spin"
                    aria-hidden="true"
                  />
                )}
                {mode === 'edit' ? tCommon('save') : tCommon('create')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UserFormDialog;
