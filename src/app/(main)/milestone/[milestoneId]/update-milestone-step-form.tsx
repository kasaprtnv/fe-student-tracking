'use client';

import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  updateMilestoneStepSchema,
  type UpdateMilestoneStepFormData,
} from '@/validations/milestone-step';
import { useMilestoneStep } from '@/hooks/use-milestone_step';
import { useTranslations } from 'next-intl';
import { IMilestoneStep } from '@/types/milestone-step';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Loader } from 'lucide-react';

interface UpdateMilestoneStepFormProps {
  isOpen: boolean;
  onClose: () => void;
  milestoneStep: IMilestoneStep | undefined;
}

const UpdateMilestoneStepForm = ({
  isOpen,
  onClose,
  milestoneStep,
}: UpdateMilestoneStepFormProps) => {
  const {
    updateExistingMilestoneStep,
    getMilestoneStepsByMilestoneId,
    storeAction,
  } = useMilestoneStep();
  const tForm = useTranslations('milestone-step.milestone-step-form');
  const tCommon = useTranslations('common');

  const form = useForm<UpdateMilestoneStepFormData>({
    resolver: zodResolver(updateMilestoneStepSchema(tForm)),
    defaultValues: {
      name: milestoneStep?.name || '',
      description: milestoneStep?.description || '',
      requiresAttachment: milestoneStep?.requiresAttachment || false,
      dayPeriod: milestoneStep?.dayPeriod || 0,
      notifyBeforeDays: milestoneStep?.notifyBeforeDays || 0,
    },
  });

  useEffect(() => {
    if (milestoneStep) {
      form.reset({
        name: milestoneStep.name || '',
        description: milestoneStep.description || '',
        requiresAttachment: milestoneStep.requiresAttachment || false,
        dayPeriod: milestoneStep.dayPeriod || 0,
        notifyBeforeDays: milestoneStep.notifyBeforeDays || 0,
      });
    }
  }, [milestoneStep, form]);

  const isDuplicateStepName = (name: string) => {
    if (!milestoneStep) return false;
    const steps = getMilestoneStepsByMilestoneId(milestoneStep.milestoneId);
    return steps.some(
      (step) =>
        step.id !== milestoneStep.id &&
        step.name.trim().toLowerCase() === name.trim().toLowerCase(),
    );
  };

  const onSubmit = async (data: UpdateMilestoneStepFormData) => {
    if (!milestoneStep?.id) return;
    if (isDuplicateStepName(data.name)) {
      form.setError('name', {
        type: 'manual',
        message: tForm('errors.name-duplicate'),
      });
      return;
    }
    if (data.notifyBeforeDays > data.dayPeriod) {
      form.setError('notifyBeforeDays', {
        type: 'manual',
        message: tForm('errors.notifyBeforeDays-greater-than-dayPeriod'),
      });
      return;
    }
    try {
      await updateExistingMilestoneStep(milestoneStep.id, data);
      toast.success(tForm('toast.updated-successfully'));
      onClose();
    } catch (error) {
      console.error('Failed to update milestone step:', error);
      toast.error(tForm('toast.update-failed'));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex flex-col gap-6 bg-gray-50 shadow-lg sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl font-semibold text-gray-800">
            {tForm('header.edit')}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            {tForm('header_description.edit')}
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
                    {tForm('label.name')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={tForm('placeholder.name')}
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
                    {tForm('label.description')}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={tForm('placeholder.description')}
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
                  <FormLabel className="text-sm font-medium text-gray-700">
                    {tForm('label.dayPeriod')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder={tForm('placeholder.dayPeriod')}
                      {...field}
                      value={Number(field.value ?? 0).toString()}
                      onChange={(e) => {
                        const val = e.target.value.replace(/^0+(?=\d)/, '');
                        field.onChange(Number(val));
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
                  <FormLabel className="text-sm font-medium text-gray-700">
                    {tForm('label.notifyBeforeDays')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder={tForm('placeholder.notifyBeforeDays')}
                      {...field}
                      value={Number(field.value ?? 0).toString()}
                      onChange={(e) => {
                        const val = e.target.value.replace(/^0+(?=\d)/, '');
                        field.onChange(Number(val));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requiresAttachment"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3 rounded-md border border-gray-300 bg-transparent p-3 shadow-xs">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked)}
                    id="requiresAttachment"
                  />
                  <FormLabel
                    htmlFor="requiresAttachment"
                    className="mb-0 cursor-pointer text-sm font-medium text-gray-700"
                  >
                    {tForm('label.requiresAttachment')}
                  </FormLabel>
                </FormItem>
              )}
            />

            <DialogFooter className="px-0">
              <div className="flex w-full justify-end gap-2">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    {tCommon('cancel')}
                  </Button>
                </DialogClose>

                <Button type="submit" disabled={storeAction === 'updating'}>
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
};

export default UpdateMilestoneStepForm;
