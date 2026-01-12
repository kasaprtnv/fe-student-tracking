import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { useTitle } from '@/hooks/use-title';
import { useTranslations } from 'next-intl';
import React from 'react';
import { useForm } from 'react-hook-form';
import {
  createTitleSchema,
  type CreateTitleFormData,
} from '@/validations/title';
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
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';

interface CreateTitleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTitleFormDialog({
  open,
  onOpenChange,
}: CreateTitleFormDialogProps) {
  const t = useTranslations('title.title-form');
  const tCommon = useTranslations('common');
  const { createNewTitle, storeAction, allTitleId, getTitleById } = useTitle();

  const form = useForm<CreateTitleFormData>({
    resolver: zodResolver(createTitleSchema(t)),
    defaultValues: {
      name: '',
    },
  });

  const isDuplicateName = (name: string) => {
    return (allTitleId ?? []).some((id) => {
      const title = getTitleById(id);
      return title?.name?.toLowerCase() === name.toLowerCase();
    });
  };

  const onSubmit = async (data: CreateTitleFormData) => {
    try {
      if (isDuplicateName(data.name)) {
        form.setError('name', {
          type: 'manual',
          message: t('errors.name-duplicate'),
        });
        return;
      }
      await createNewTitle(data);
      form.reset();
      onOpenChange(false);
      toast.success(t('toast.created-successfully'));
    } catch (error) {
      console.error('Error creating title:', error);
      toast.error(t('toast.creation-failed'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('header.create')}</DialogTitle>
          <DialogDescription>
            {t('header_description.create')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  {tCommon('cancel')}
                </Button>
              </DialogClose>
              <Button type="submit" disabled={storeAction === 'creating'}>
                {storeAction === 'creating' && (
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
}
