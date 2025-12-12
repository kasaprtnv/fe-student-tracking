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
import { Textarea } from '@/components/ui/textarea';
import { Loader } from 'lucide-react';
import { ButtonGroup, ButtonGroupText } from '@/components/ui/button-group';
import { InputGroup, InputGroupInput } from '@/components/ui/input-group';
import { useMilestone } from '@/hooks/use-milestone';
import { IMilestone } from '@/types/milestone';
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
  const { createNewMilestoneStep, storeAction } = useMilestoneStep();
  const { getMilestoneById } = useMilestone();
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
    },
  });

  const milestone = getMilestoneById(milestoneId) as IMilestone;

  const onSubmit = async (data: CreateMilestoneStepFormData) => {
    try {
      if ((data?.dayPeriod ?? 0) > milestone.dayPeriod) {
        form.setError('dayPeriod', {
          type: 'manual',
          message: tForm('errors.dayPeriod-exceeds', {
            value: milestone.dayPeriod,
          }),
        });
        return;
      }
      await createNewMilestoneStep({
        ...data,
        milestoneId,
        position: stepsLength + 1, // Default position
      });
      form.reset();
      onClose();
    } catch (error) {
      console.error('Error creating milestone step:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tForm('header.create')}</DialogTitle>
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
                    <ButtonGroup className="w-full flex-nowrap">
                      <InputGroup>
                        <InputGroupInput
                          type="number"
                          placeholder={tForm('placeholder.dayPeriod')}
                          {...field}
                          value={field.value ?? 1}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </InputGroup>
                      <ButtonGroupText className="whitespace-nowrap">
                        {`${milestone?.dayPeriod} ${tCommon('days')}`}
                      </ButtonGroupText>
                    </ButtonGroup>
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
                      value={field.value ?? 0}
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
              <Button type="submit" disabled={storeAction === 'loading'}>
                {storeAction === 'loading' && (
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                )}
                {tCommon('create')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMilestoneStepForm;
