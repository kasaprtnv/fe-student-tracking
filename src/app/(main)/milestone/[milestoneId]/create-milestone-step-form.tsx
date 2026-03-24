'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createMilestoneStepSchema,
  type CreateMilestoneStepFormData,
} from '@/validations/milestone-step';
import { useMilestoneStep } from '@/hooks/use-milestone_step';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import { Loader } from 'lucide-react';
import { toast } from 'sonner';

interface CreateMilestoneStepFormProps {
  isOpen: boolean;
  onClose: () => void;
  milestoneId: string;
  stepsLength: number;
}

const CreateMilestoneStepForm = ({
  isOpen,
  onClose,
  milestoneId,
  stepsLength,
}: CreateMilestoneStepFormProps) => {
  const {
    createNewMilestoneStep,
    getMilestoneStepsByMilestoneId,
    storeAction,
  } = useMilestoneStep();
  const tForm = useTranslations('milestone-step.milestone-step-form');
  const tCommon = useTranslations('common');

  const form = useForm<CreateMilestoneStepFormData>({
    resolver: zodResolver(createMilestoneStepSchema(tForm)),
    defaultValues: {
      name: '',
      description: '',
      requiresAttachment: false,
      dayPeriod: 0,
      notifyBeforeDays: 0,
      secondNotifyBeforeDays: 0,
    },
  });

  const isDuplicateStepName = (name: string) => {
    const steps = getMilestoneStepsByMilestoneId(milestoneId);
    return steps.some(
      (step) => step.name.trim().toLowerCase() === name.trim().toLowerCase(),
    );
  };
  const onSubmit = async (data: CreateMilestoneStepFormData) => {
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
    if (data.secondNotifyBeforeDays > data.dayPeriod) {
      form.setError('secondNotifyBeforeDays', {
        type: 'manual',
        message: tForm('errors.secondNotifyBeforeDays-greater-than-dayPeriod'),
      });
      return;
    }
    // 0 means "no second notification", so only validate ordering when second notification is enabled.
    if (
      data.secondNotifyBeforeDays > 0 &&
      data.secondNotifyBeforeDays >= data.notifyBeforeDays
    ) {
      form.setError('secondNotifyBeforeDays', {
        type: 'manual',
        message: tForm(
          'errors.secondNotifyBeforeDays-greater-than-notifyBeforeDays',
        ),
      });
      return;
    }
    try {
      await createNewMilestoneStep({
        ...data,
        milestoneId,
        position: stepsLength + 1,
      });
      toast.success(tForm('toast.created-successfully'));
      form.reset();
      onClose();
    } catch (error) {
      console.error('Error creating milestone step:', error);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="flex flex-col gap-6 bg-gray-50 shadow-lg sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl font-semibold text-gray-800">
            {tForm('header.create')}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            {tForm('header_description.create')}
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
                    {tForm('label.description')}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={tForm('placeholder.description')}
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
                      className="border-gray-300 bg-white"
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
                      className="border-gray-300 bg-white"
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
              name="secondNotifyBeforeDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    {tForm('label.secondNotifyBeforeDays')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder={tForm('placeholder.secondNotifyBeforeDays')}
                      className="border-gray-300 bg-white"
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
                <FormItem className="flex items-center gap-3 rounded-md border border-gray-300 bg-white p-3 shadow-xs">
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

                <Button disabled={storeAction === 'loading'} type="submit">
                  {storeAction === 'loading' && (
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
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

export default CreateMilestoneStepForm;
