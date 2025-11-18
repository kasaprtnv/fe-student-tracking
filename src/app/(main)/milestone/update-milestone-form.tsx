'use client';

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useMilestone } from '@/hooks/use-milestone';
import { useTranslations } from 'next-intl';
import { useForm, type SubmitHandler } from 'react-hook-form';
import {
  updateMilestoneSchema,
  type UpdateMilestoneFormData,
} from '@/validations/milestone';
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
import { IMilestone } from '@/types/milestone';
import { useEffect } from 'react';

interface UpdateMilestoneFormSheetProps
  extends React.ComponentPropsWithRef<typeof Sheet> {
  milestone?: IMilestone | null;
}

export function UpdateMilestoneFormSheet({
  milestone,
  onOpenChange,
  ...props
}: UpdateMilestoneFormSheetProps) {
  const t = useTranslations('milestone.milestone-form');
  const tCommon = useTranslations('common');

  const {
    updateExistingMilestone,
    storeAction,
    allMilestoneId,
    getMilestoneById,
  } = useMilestone();

  // ⭐ ใช้ generic แบบ 3 parameter เพื่อแก้ TS Control error
  const form = useForm<
    UpdateMilestoneFormData,
    unknown,
    UpdateMilestoneFormData
  >({
    resolver: zodResolver(updateMilestoneSchema(t)),
    defaultValues: {
      name: '',
      courseId: '',
      description: '',
      position: 1,
      notifyReceiverEmail: '',
      notifyBeforeDays: 0,
      deadlineDate: '',
    },
  });

  // ⭐ Reset form เมื่อ milestone เปลี่ยน และ milestone ต้องไม่ใช่ null
  useEffect(() => {
    if (!milestone) return;

    form.reset({
      name: milestone.name ?? '',
      courseId: milestone.courseId ?? '',
      description: milestone.description ?? '',
      position: milestone.position ?? 1,
      notifyReceiverEmail: milestone.notifyReceiverEmail ?? '',
      notifyBeforeDays: milestone.notifyBeforeDays ?? 0,
      deadlineDate: milestone.deadlineDate
        ? milestone.deadlineDate.substring(0, 10)
        : '',
    });
  }, [milestone]);

  const isDuplicateCourseId = (courseId: string) =>
    (allMilestoneId ?? []).some((id) => {
      const existing = getMilestoneById(id);
      return existing?.courseId === courseId && existing.id !== milestone?.id;
    });

  // ⭐ onSubmit type-safe แบบสมบูรณ์
  const onSubmit: SubmitHandler<UpdateMilestoneFormData> = async (data) => {
    if (!milestone?.id) return;

    try {
      if (isDuplicateCourseId(data.courseId)) {
        form.setError('courseId', {
          type: 'manual',
          message: t('errors.courseId-duplicate'),
        });
        return;
      }

      await updateExistingMilestone(milestone.id, {
        ...data,
        position: Number(data.position),
        notifyBeforeDays: Number(data.notifyBeforeDays),
        deadlineDate: data.deadlineDate
          ? new Date(data.deadlineDate).toISOString()
          : '',
      });

      toast.success(t('toast.updated-successfully'));
      onOpenChange?.(false);
    } catch (error) {
      console.error('Failed to update milestone:', error);
      toast.error(t('toast.update-failed'));
    }
  };

  return (
    <Sheet {...props} onOpenChange={(open) => onOpenChange?.(open)}>
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
            {/* name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('label.name')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('placeholder.name')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* courseId */}
            <FormField
              control={form.control}
              name="courseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('label.courseId')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('placeholder.courseId')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('label.description')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('placeholder.description')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* deadline */}
            <FormField
              control={form.control}
              name="deadlineDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('label.deadlineDate')}</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* notifyReceiverEmail */}
            <FormField
              control={form.control}
              name="notifyReceiverEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('label.notifyReceiverEmail')}</FormLabel>
                  <FormControl>
                    <Input placeholder="example@mail.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* position */}
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('label.position')}</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* notifyBeforeDays */}
            <FormField
              control={form.control}
              name="notifyBeforeDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('label.notifyBeforeDays')}</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* footer */}
            <SheetFooter>
              <div className="flex w-full justify-end gap-2">
                <SheetClose asChild>
                  <Button variant="outline">{tCommon('cancel')}</Button>
                </SheetClose>

                <Button type="submit" disabled={storeAction === 'updating'}>
                  {storeAction === 'updating' && (
                    <Loader className="mr-2 size-4 animate-spin" />
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
