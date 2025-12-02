'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { User } from '@/types/user';

// Teacher schema - unified for both create and update (no courseId for teachers)
const teacherSchema = (t: (key: string) => string) =>
  z.object({
    firstName: z
      .string()
      .min(1, t('first-name-required'))
      .min(2, t('first-name-min'))
      .max(50, t('first-name-max')),
    lastName: z
      .string()
      .min(1, t('last-name-required'))
      .min(2, t('last-name-min'))
      .max(50, t('last-name-max')),
    email: z.string().email(t('email-invalid')),
    phone: z.string().max(20, t('phone-max')).optional().or(z.literal('')),
  });

type TeacherFormData = z.infer<ReturnType<typeof teacherSchema>>;

interface TeacherFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<User>) => Promise<void>;
  user: User | null;
  isLoading: boolean;
  mode: 'create' | 'edit';
}

const TeacherFormDialog = ({
  open,
  onClose,
  onSubmit,
  user,
  isLoading,
  mode,
}: TeacherFormDialogProps) => {
  const t = useTranslations('user');
  const tCommon = useTranslations('common');

  const schema = teacherSchema(t);

  const form = useForm<TeacherFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    },
  });

  // Reset form when user changes or mode changes
  React.useEffect(() => {
    if (user && open && mode === 'edit') {
      form.reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    } else if (!user && open && mode === 'create') {
      form.reset({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
      });
    }
  }, [user, open, form, mode]);

  const handleSubmit = async (data: TeacherFormData) => {
    await onSubmit({ ...data, role: 'teacher' });
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? t('edit-teacher') : t('add-teacher')}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('first-name')}
                      <span className="text-destructive"> *</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('first-name-placeholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('last-name')}
                      <span className="text-destructive"> *</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('last-name-placeholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('email')}
                    <span className="text-destructive"> *</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t('email-placeholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('phone')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('phone-placeholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                {tCommon('cancel')}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && (
                  <Loader
                    className="mr-2 size-4 animate-spin"
                    aria-hidden="true"
                  />
                )}
                {mode === 'edit' ? tCommon('save') : tCommon('create')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TeacherFormDialog;
