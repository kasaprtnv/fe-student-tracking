import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import React from 'react';
import { useTitle } from '@/hooks/use-title';
import { ITitle } from '@/types/title';
import {
  updateTitleSchema,
  type UpdateTitleFormData,
} from '@/validations/title';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';

interface UpdateTitleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ITitle | undefined;
}

export function UpdateTitleFormDialog({
  open,
  onOpenChange,
  title,
}: UpdateTitleFormDialogProps) {
  const t = useTranslations('title.title-form');
  const tCommon = useTranslations('common');
  const { updateExistingTitle, storeAction, allTitleId, getTitleById } =
    useTitle();

  const form = useForm<UpdateTitleFormData>({
    resolver: zodResolver(updateTitleSchema(t)),
    defaultValues: {
      name: title?.name || '',
      description: title?.description || '',
    },
  });

  const isDuplicateName = (name: string) => {
    return (allTitleId ?? []).some((id) => {
      const existingTitle = getTitleById(id);
      return (
        existingTitle?.name?.toLowerCase() === name.toLowerCase() &&
        existingTitle?.id !== title?.id
      );
    });
  };

  const onSubmit = async (data: UpdateTitleFormData) => {
    if (!title?.id || !data) return;
    try {
      if (isDuplicateName(data.name)) {
        form.setError('name', {
          type: 'manual',
          message: t('errors.name-duplicate'),
        });
        return;
      }
      await updateExistingTitle(title.id, data);
      form.reset();
      onOpenChange(false);
      toast.success(t('toast.updated-successfully'));
    } catch (error: unknown) {
      // เพิ่มการแสดงรายละเอียด error
      let errorMessage = '';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error
      ) {
        errorMessage = String((error as { message?: string }).message);
      } else {
        errorMessage = String(error);
      }
      console.error('Failed to update title:', errorMessage);
      toast.error(
        t('toast.update-failed') + (errorMessage ? `: ${errorMessage}` : ''),
      );
    }
  };

  React.useEffect(() => {
    if (title) {
      form.reset({
        name: title.name || '',
        description: title.description || '',
      });
    }
  }, [title, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('header.edit')}</DialogTitle>
          <DialogDescription>{t('header_description.edit')}</DialogDescription>
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
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('label.description') || 'Description'}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        t('placeholder.description') || 'Description'
                      }
                      {...field}
                    />
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
              <Button type="submit" disabled={storeAction === 'updating'}>
                {storeAction === 'updating' && (
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                )}
                {tCommon('save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
