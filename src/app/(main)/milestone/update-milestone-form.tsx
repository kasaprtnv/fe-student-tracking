'use client';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import React from 'react';

interface UpdateMilestoneFormSheetProps
  extends React.ComponentPropsWithRef<typeof Dialog> {
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
    getMilestoneById,
    allMilestoneIds,
  } = useMilestone();

  const isMilestoneUsed = milestone?.isUsed;

  const form = useForm<UpdateMilestoneFormData>({
    resolver: zodResolver(updateMilestoneSchema(t)),
    defaultValues: {
      name: milestone?.name || '',
      description: milestone?.description || '',
      dayPeriod: milestone?.dayPeriod || 0,
      notifyBeforeDays: milestone?.notifyBeforeDays || 0,
    },
  });

  useEffect(() => {
    if (!milestone) return;

    form.reset({
      name: milestone.name ?? '',
      description: milestone.description ?? '',
      dayPeriod: milestone.dayPeriod ?? 0,
      notifyBeforeDays: milestone.notifyBeforeDays ?? 0,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [milestone]);

  const isDuplicateMilestoneName = (name: string) => {
    return allMilestoneIds.some(
      (id) =>
        getMilestoneById(id)?.name.toLowerCase() === name.toLowerCase() &&
        getMilestoneById(id)?.id !== milestone?.id,
    );
  };
  // ⭐ onSubmit type-safe แบบสมบูรณ์
  const onSubmit: SubmitHandler<UpdateMilestoneFormData> = async (data) => {
    if (!milestone?.id) return;
    try {
      if (isDuplicateMilestoneName(data.name)) {
        form.setError('name', {
          type: 'manual',
          message: t('errors.name-duplicate'),
        });
        return;
      } else {
        await updateExistingMilestone(milestone.id, {
          ...data,
          notifyBeforeDays: Number(data.notifyBeforeDays),
        });
      }

      toast.success(t('toast.updated-successfully'));
      onOpenChange?.(false);
    } catch (error) {
      console.error('Failed to update milestone:', error);
      toast.error(t('toast.update-failed'));
    }
  };

  return (
    <Dialog {...props} onOpenChange={(open) => onOpenChange?.(open)}>
      <DialogContent className="flex flex-col gap-6 bg-gray-50 shadow-lg sm:max-w-md">
        <DialogHeader className="text-left">
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
            {/* name */}
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
                      {...field}
                      disabled={isMilestoneUsed}
                    />
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
                  <FormLabel className="text-sm font-medium text-gray-700">
                    {t('label.description')}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('placeholder.description')}
                      {...field}
                      disabled={isMilestoneUsed}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* dayPeriod */}
            {/* <FormField
              control={form.control}
              name="dayPeriod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    {t('label.dayPeriod')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      disabled={isMilestoneUsed}
                      {...field}
                      onChange={(e) => {
                        const value = Number(e.target.value);

                        if (
                          notifyBeforeDays !== undefined &&
                          value < notifyBeforeDays
                        ) {
                          form.setError('notifyBeforeDays', {
                            type: 'manual',
                            message: t(
                              'errors.notifyBeforeDays-greater-than-dayPeriod',
                            ),
                          });
                          return; // 🔒 lock ไม่ให้เปลี่ยนค่า
                        }

                        form.clearErrors('notifyBeforeDays');
                        field.onChange(value); // ✅ ผ่านเท่านั้น
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

            {/* notifyBeforeDays */}
            {/* <FormField
              control={form.control}
              name="notifyBeforeDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    {t('label.notifyBeforeDays')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      disabled={isMilestoneUsed}
                      {...field}
                      onChange={(e) => {
                        const value = Number(e.target.value);

                        if (dayPeriod !== undefined && value > dayPeriod) {
                          form.setError('notifyBeforeDays', {
                            type: 'manual',
                            message: t(
                              'errors.notifyBeforeDays-greater-than-dayPeriod',
                            ),
                          });
                          return; // 🔒 lock
                        }

                        form.clearErrors('notifyBeforeDays');
                        field.onChange(value); // ✅ ผ่านเท่านั้น
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

            {/* footer */}
            <DialogFooter>
              <div className="flex w-full justify-end gap-2">
                <DialogClose asChild>
                  <Button variant="outline">{tCommon('cancel')}</Button>
                </DialogClose>

                <Button
                  type="submit"
                  disabled={storeAction === 'updating' || isMilestoneUsed}
                >
                  {storeAction === 'updating' && (
                    <Loader className="mr-2 size-4 animate-spin" />
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
