import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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

interface UpdateCourseFormSheetProps
  extends React.ComponentPropsWithRef<typeof Sheet> {
  course: ICourse | undefined;
}

export function UpdateCourseFormSheet({
  course,
  ...props
}: UpdateCourseFormSheetProps) {
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
        props.onOpenChange?.(false);
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
    });
  }, [course, form]);

  return (
    <Sheet {...props}>
      <SheetContent className="flex flex-col gap-6 bg-gray-50 shadow-lg sm:max-w-md">
        <SheetHeader className="text-left">
          <SheetTitle className="text-xl font-semibold text-gray-800">
            {t('header.edit')}
          </SheetTitle>
          <SheetDescription className="text-sm text-gray-600">
            {t('header_description.edit')}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-1 flex-col gap-4 overflow-y-auto px-4"
          >
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
                      placeholder={t('placeholder.name')}
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    {t('label.description')}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('placeholder.description')}
                      className="resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter className="px-0">
              <div className="flex flex-1 justify-end space-x-2">
                <SheetClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    {tCommon('cancel')}
                  </Button>
                </SheetClose>
                <Button
                  disabled={storeAction === 'updating'}
                  type="submit"
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  {storeAction === 'updating' && (
                    <Loader
                      className="mr-2 size-4 animate-spin"
                      aria-hidden="true"
                    />
                  )}
                  {tCommon('save')}
                </Button>
              </div>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
