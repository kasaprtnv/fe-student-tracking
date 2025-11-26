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
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import React from 'react';

export function CreateMilestoneFormSheet({
  ...props
}: React.ComponentPropsWithRef<typeof Sheet>) {
  const t = useTranslations('milestone.milestone-form');
  const tCommon = useTranslations('common');

  const { createNewMilestone, storeAction, allMilestoneIds, getMilestoneById } =
    useMilestone();
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

  const form = useForm<CreateMilestoneFormData>({
    resolver: zodResolver(createMilestoneSchema(t)),
    defaultValues: {
      name: '',
      description: '',
      courseId: '',
      position: 1,
      notifyReceiverEmail: '',
      deadlineDate: undefined,
      notifyBeforeDays: 0,
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
          position: Number(data.position),
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

  return (
    <Sheet {...props} onOpenChange={handleOpenChange}>
      <SheetContent className="flex flex-col gap-6 bg-gray-50 shadow-lg sm:max-w-md">
        <SheetHeader className="text-left">
          <SheetTitle className="text-xl font-semibold text-gray-800">
            {t('header.create')}
          </SheetTitle>
          <SheetDescription className="text-sm text-gray-600">
            {t('header_description.create')}
          </SheetDescription>
        </SheetHeader>

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
              name="courseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    {t('label.courseId')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('placeholder.courseId')}
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

            <FormField
              control={form.control}
              name="notifyReceiverEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    {t('label.notifyReceiverEmail')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('placeholder.notifyReceiverEmail')}
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

            <SheetFooter className="px-0">
              <div className="flex flex-1 justify-end space-x-2">
                <SheetClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    {tCommon('cancel')}
                  </Button>
                </SheetClose>

                <Button
                  disabled={storeAction === 'creating'}
                  type="submit"
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  {storeAction === 'creating' && (
                    <Loader className="mr-2 size-4 animate-spin" />
                  )}

                  {tCommon('submit')}
                </Button>
              </div>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
