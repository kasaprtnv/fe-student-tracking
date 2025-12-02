import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { useCourse } from '@/hooks/use-course';
import { useTranslations } from 'next-intl';
import React from 'react';
import { useForm } from 'react-hook-form';
import {
  createCourseSchema,
  type CreateCourseFormData,
} from '@/validations/course';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';

export function CreateCourseFormDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations('course.course-form');
  const tCommon = useTranslations('common');
  const { createNewCourse, storeAction, allCourseId, getCourseById } =
    useCourse();
  const form = useForm<CreateCourseFormData>({
    resolver: zodResolver(createCourseSchema(t)),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      degree: '',
    },
  });

  const isDuplicateCode = (code: string) => {
    return (allCourseId ?? []).some((id) => {
      const course = getCourseById(id);
      return course?.code === code;
    });
  };

  const onSubmit = async (data: CreateCourseFormData) => {
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
        return;
      } else {
        await createNewCourse(data);
        form.reset();
        onOpenChange(false);
        toast.success(t('toast.created-successfully'));
      }
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error(t('toast.creation-failed'));
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset(); // Reset form when closing the Dialog
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex flex-col gap-6 bg-gray-50 shadow-lg sm:max-w-md">
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
