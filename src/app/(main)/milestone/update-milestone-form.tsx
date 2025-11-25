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
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';
import { IMilestone } from '@/types/milestone';
import { useEffect } from 'react';
import React from 'react';

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
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const {
    updateExistingMilestone,
    storeAction,
    allMilestoneId,
    getMilestoneById,
  } = useMilestone();

  const form = useForm<UpdateMilestoneFormData>({
    resolver: zodResolver(updateMilestoneSchema(t)),
    defaultValues: {
      name: milestone?.name || '',
      courseId: milestone?.courseId || '',
      description: milestone?.description || '',
      position: milestone?.position || 1,
      notifyReceiverEmail: milestone?.notifyReceiverEmail || '',
      deadlineDate: milestone?.deadlineDate || undefined,
      notifyBeforeDays: milestone?.notifyBeforeDays || 0,
    },
  });

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
        ? new Date(milestone.deadlineDate)
        : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [milestone]);

  const isDuplicateMilestoneName = (name: string) => {
    return allMilestoneId.some(
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
          position: Number(data.position),
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
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      {t('label.deadlineDate')}
                    </FormLabel>
                    <FormControl>
                      <Popover
                        open={isPopoverOpen}
                        onOpenChange={setIsPopoverOpen}
                      >
                        <PopoverTrigger asChild>
                          <Input
                            readOnly
                            value={
                              field.value
                                ? new Date(field.value).toLocaleDateString()
                                : t('placeholder.deadlineDate')
                            }
                            placeholder={t('placeholder.deadlineDate')}
                            className="cursor-pointer border-gray-300 text-left"
                          />
                        </PopoverTrigger>
                        <PopoverContent>
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              if (date) {
                                const utcDate = new Date(
                                  Date.UTC(
                                    date.getFullYear(),
                                    date.getMonth(),
                                    date.getDate(),
                                  ),
                                );
                                field.onChange(utcDate);
                                form.setValue('deadlineDate', utcDate);
                              } else {
                                field.onChange(date);
                              }
                              setIsPopoverOpen(false);
                            }}
                            captionLayout="dropdown"
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
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
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      min={1}
                    />
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
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      min={0}
                    />
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
