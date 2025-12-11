'use client';

import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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

interface UpdateMilestoneStepFormProps {
  isOpen: boolean;
  onClose: () => void;
  milestoneStep?: IMilestoneStep | null;
}

const UpdateMilestoneStepForm = ({
  isOpen,
  onClose,
  milestoneStep,
}: UpdateMilestoneStepFormProps) => {
  const { updateExistingMilestoneStep } = useMilestoneStep();
  const tForm = useTranslations('milestone-step.milestone-step-form');
  const tCommon = useTranslations('common');

  const form = useForm<UpdateMilestoneStepFormData>({
    resolver: zodResolver(updateMilestoneStepSchema(tForm)),
    defaultValues: {
      name: milestoneStep?.name || '',
      description: milestoneStep?.description || '',
      requiresAttachment: milestoneStep?.requiresAttachment || false,
      dayPeriod: milestoneStep?.dayPeriod || undefined,
      notifyBeforeDays: milestoneStep?.notifyBeforeDays || undefined,
    },
  });

  useEffect(() => {
    if (milestoneStep) {
      form.reset({
        name: milestoneStep.name || '',
        description: milestoneStep.description || '',
        requiresAttachment: milestoneStep.requiresAttachment || false,
        dayPeriod: milestoneStep.dayPeriod || undefined,
        notifyBeforeDays: milestoneStep.notifyBeforeDays || undefined,
      });
    }
  }, [milestoneStep, form]);

  const onSubmit = async (data: UpdateMilestoneStepFormData) => {
    if (!milestoneStep?.id) return;

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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tForm('header.edit')}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tForm('label.name')}</FormLabel>
                  <FormControl>
                    <Input placeholder={tForm('placeholder.name')} {...field} />
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
                  <FormLabel>{tForm('label.description')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={tForm('placeholder.description')}
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
                  <FormLabel>{tForm('label.dayPeriod')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={tForm('placeholder.dayPeriod')}
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(Number(e.target.value))}
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
                  <FormLabel>{tForm('label.notifyBeforeDays')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={tForm('placeholder.notifyBeforeDays')}
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(Number(e.target.value))}
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
                <FormItem className="flex items-center space-x-2">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked)}
                  />
                  <FormLabel>{tForm('label.requiresAttachment')}</FormLabel>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={onClose}>
                {tCommon('cancel')}
              </Button>
              <Button type="submit">{tCommon('save')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateMilestoneStepForm;
