'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
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

// Student schema - unified for both create and update
const studentSchema = (t: (key: string) => string) =>
  z.object({
    code: z.string().min(1, t('code-required')),
    firstName: z
      .string()
      .min(1, t('first-name-required'))
      .min(2, t('first-name-min'))
      .max(50, t('first-name-max')),
    lastName: z
      .string()
      .min(1, t('last-name-required'))
      .min(2, t('last-name-min'))
      .max(50, t('last-name-max')),
    email: z.string().optional().or(z.literal('')),
    phone: z.string().max(20, t('phone-max')).optional().or(z.literal('')),
    degree: z.string().max(100, t('degree-max')).optional().or(z.literal('')),
    year: z.string().max(10, t('year-max')).optional().or(z.literal('')),
    courseId: z.string().min(1, t('course-required-for-student')),
  });

type StudentFormData = z.infer<ReturnType<typeof studentSchema>>;

interface StudentFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<User>) => Promise<void>;
  user: User | null;
  isLoading: boolean;
  mode: 'create' | 'edit';
}

const StudentFormDialog = ({
  open,
  onClose,
  onSubmit,
  user,
  isLoading,
  mode,
}: StudentFormDialogProps) => {
  const t = useTranslations('user');
  const tCommon = useTranslations('common');

  // Fetch courses for dropdown
  const { courseMap, allCourseId, fetchAllCourses } = useCourse();
  const courses = allCourseId.map((id) => courseMap[id]).filter(Boolean);

  // Fetch courses on mount
  React.useEffect(() => {
    fetchAllCourses();
  }, [fetchAllCourses]);

  const schema = studentSchema(t);

  const form = useForm<StudentFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      degree: '',
      year: '',
      courseId: '',
    },
  });

  // Reset form when user changes or mode changes
  React.useEffect(() => {
    if (user && open && mode === 'edit') {
      form.reset({
        code: user.code || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        degree: user.degree || '',
        year: user.year || '',
        courseId: user.courseId || '',
      });
    } else if (!user && open && mode === 'create') {
      form.reset({
        code: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        degree: '',
        year: '',
        courseId: '',
      });
    }
  }, [user, open, form, mode]);

  const handleSubmit = async (data: StudentFormData) => {
    await onSubmit({ ...data, role: 'student' });
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
            {mode === 'edit' ? t('edit-student') : t('add-student')}
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

export default StudentFormDialog;
