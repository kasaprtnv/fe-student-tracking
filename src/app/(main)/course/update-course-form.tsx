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
import React from 'react';
import { useCourse } from '@/hooks/use-course';
import { ICourse } from '@/types/course';
import {
  updateCourseSchema,
  type UpdateCourseFormData,
} from '@/validations/course';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';
import { SelectOption } from '@/types';
import { MultiCombobox } from '@/components/ui/combobox/multiple-combobox';
import { DegreesCombobox } from '@/components/degree-combobox';

interface UpdateCourseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: ICourse | undefined;
  teacherOptions: SelectOption[];
  onSuccess?: () => void;
}

export function UpdateCourseFormDialog({
  open,
  onOpenChange,
  course,
  teacherOptions,
  onSuccess,
}: UpdateCourseFormDialogProps) {
  const t = useTranslations('course.course-form');
  const tCommon = useTranslations('common');
  const { updateExistingCourse, storeAction, allCourseId, getCourseById } =
    useCourse();

  const form = useForm<UpdateCourseFormData>({
    resolver: zodResolver(updateCourseSchema(t)),
    defaultValues: {
      code: course?.code || '',
      name: course?.name || '',
      description: course?.description || '',
      degree: course?.degree || '',
      staffIds: course?.staffIds || [],
    },
  });

  const isDuplicateCode = (code: string) => {
    return (allCourseId ?? []).some((id) => {
      const existingCourse = getCourseById(id);
      return existingCourse?.code === code && existingCourse?.id !== course?.id;
    });
  };

  const onSubmit = async (data: UpdateCourseFormData) => {
    if (!course?.id || !data) return;
    try {
      if (data.code.length > 10) {
        form.setError('code', {
          type: 'manual',
          message: t('errors.code-too-long'),
        });
        return;
      }

      if (isDuplicateCode(data.code)) {
        form.setError('code', {
          type: 'manual',
          message: t('errors.code-duplicate'),
        });
      } else {
        await updateExistingCourse(course.id, data);
        form.reset();
        onOpenChange(false);
        onSuccess?.();
        toast.success(t('toast.updated-successfully'));
      }
    } catch (error) {
      console.error('Failed to update course:', error);
      toast.error(t('toast.update-failed'));
    }
  };

  React.useEffect(() => {
    form.reset({
      code: course?.code || '',
      name: course?.name || '',
      description: course?.description || '',
      degree: course?.degree || '',
      staffIds: course?.staffIds || [],
    });
  }, [course, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col gap-6 bg-gray-50 shadow-lg sm:max-w-md">
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
            className="flex flex-1 flex-col gap-4 overflow-y-auto px-4"
          >
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
                      disabled={course?.isUsed}
                      maxLength={10}
                      placeholder={t('placeholder.code')}
                      className="border-gray-300 bg-white"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    {t('label.name')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={course?.isUsed}
                      placeholder={t('placeholder.name')}
                      className="border-gray-300 bg-white"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    {t('label.description')}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={course?.isUsed}
                      placeholder={t('placeholder.description')}
                      className="resize-none border-gray-300 bg-white"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="degree"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    {t('label.degree')}
                  </FormLabel>
                  <FormControl>
                    <DegreesCombobox
                      disabled={course?.isUsed}
                      defaultValue={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="staffIds"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      {t('label.staffIds')}
                    </FormLabel>
                    <FormControl>
                      <MultiCombobox
                        defaultValue={field.value}
                        placeholder={t('placeholder.staffIds')}
                        placeholderSearch={t('placeholder.search-staff')}
                        placeholderEmpty={t('placeholder.no-staff-found')}
                        options={teacherOptions}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
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
