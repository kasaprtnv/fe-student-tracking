import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { useMilestone } from '@/hooks/use-milestone';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import {
  createMilestoneSchema,
  type CreateMilestoneFormData,
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

import React from 'react';

export function CreateMilestoneFormSheet({
  ...props
}: React.ComponentPropsWithRef<typeof Dialog>) {
  const t = useTranslations('milestone.milestone-form');
  const tCommon = useTranslations('common');

  const { createNewMilestone, storeAction, allMilestoneIds, getMilestoneById } =
    useMilestone();

  const form = useForm<CreateMilestoneFormData>({
    resolver: zodResolver(createMilestoneSchema(t)),
    defaultValues: {
      name: '',
      description: '',
      notifyBeforeDays: 0,
      dayPeriod: 0,
    },
  });

  const isDuplicateMilestoneName = (name: string) => {
    return allMilestoneIds.some(
      (id) => getMilestoneById(id)?.name.toLowerCase() === name.toLowerCase(),
    );
  };

  const onSubmit = async (data: CreateMilestoneFormData) => {
    try {
      if (isDuplicateMilestoneName(data.name)) {
        form.setError('name', {
          type: 'manual',
          message: t('errors.name-duplicate'),
        });
        return;
      } else {
        await createNewMilestone({
          ...data,
          notifyBeforeDays: Number(data.notifyBeforeDays),
        });
        form.reset();
        props.onOpenChange?.(false);
        toast.success(t('toast.created-successfully'));
      }
    } catch (error) {
      console.error('Error creating milestone:', error);
      toast.error(t('toast.creation-failed'));
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) form.reset();
    props.onOpenChange?.(open);
  };
  const dayPeriod = form.watch('dayPeriod');
  const notifyBeforeDays = form.watch('notifyBeforeDays');

  return (
    <Dialog {...props} onOpenChange={handleOpenChange}>
      <DialogContent className="flex flex-col gap-6 bg-gray-50 shadow-lg sm:max-w-md">
        <DialogHeader className="text-left">
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
              name="dayPeriod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('label.dayPeriod')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
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
                          return; // 🔒 ไม่ให้ค่าเข้า
                        }

                        form.clearErrors('notifyBeforeDays');
                        field.onChange(value); // ✅ เรียกเฉพาะตอนผ่าน
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notifyBeforeDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('label.notifyBeforeDays')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
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
                        field.onChange(value); // ✅ ผ่านเงื่อนไขเท่านั้น
                      }}
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
