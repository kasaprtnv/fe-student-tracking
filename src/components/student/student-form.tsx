'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  createStudentSchema,
  updateStudentSchema,
  type CreateStudentFormData,
  type UpdateStudentFormData,
} from '@/validations/student';
import { Student } from '@/types/student';
import { useStudent } from '@/hooks/use-student';
import { useState, useMemo } from 'react';

interface StudentFormProps {
  mode: 'create' | 'edit';
  student?: Student;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function StudentForm({
  mode,
  student,
  onSuccess,
  onCancel,
}: StudentFormProps) {
  const t = useTranslations('student-form.errors');
  const tLabel = useTranslations('student-form.label');
  const { createNewStudent, updateExistingStudent, storeAction } = useStudent();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = mode === 'edit';

  // สร้าง schema พร้อม translations
  const schema = useMemo(
    () => (isEdit ? updateStudentSchema(t) : createStudentSchema(t)),
    [isEdit, t],
  );

  const form = useForm<CreateStudentFormData | UpdateStudentFormData>({
    resolver: zodResolver(schema),
    defaultValues:
      isEdit && student
        ? {
            studentId: student.studentId || '',
            firstname: student.firstname || '',
            lastname: student.lastname || '',
            degree: student.degree || '',
          }
        : {
            studentId: '',
            firstname: '',
            lastname: '',
            degree: '',
          },
    mode: 'onChange',
  });

  const onSubmit = async (
    data: CreateStudentFormData | UpdateStudentFormData,
  ) => {
    setIsSubmitting(true);

    try {
      if (isEdit && student?.id) {
        await updateExistingStudent(student.id, {
          ...data,
        });
      } else {
        await createNewStudent({
          ...data,
        });
      }

      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-6">
        <h2 className="text-center text-2xl font-bold">
          {isEdit ? 'Edit Student' : 'Create New Student'}
        </h2>
        <p className="text-muted-foreground mt-1 text-center text-sm">
          {isEdit
            ? `Editing: ${student?.firstname} ${student?.lastname}`
            : 'Fill in the details below'}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="studentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tLabel('student-id')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={tLabel('student-id-placeholder')}
                    {...field}
                    disabled={isSubmitting || storeAction !== 'none'}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="firstname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tLabel('first-name')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={tLabel('first-name-placeholder')}
                    {...field}
                    disabled={isSubmitting || storeAction !== 'none'}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tLabel('last-name')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={tLabel('last-name-placeholder')}
                    {...field}
                    disabled={isSubmitting || storeAction !== 'none'}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="degree"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tLabel('degree')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={tLabel('degree-placeholder')}
                    {...field}
                    disabled={isSubmitting || storeAction !== 'none'}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.formState.errors.root && (
            <div className="text-destructive bg-destructive/10 border-destructive/20 rounded-md border p-3 text-sm">
              {form.formState.errors.root.message}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || storeAction !== 'none'}
              className="flex-1"
            >
              {isSubmitting || storeAction !== 'none'
                ? isEdit
                  ? 'Updating...'
                  : 'Creating...'
                : isEdit
                  ? 'Update Student'
                  : 'Create Student'}
            </Button>

            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting || storeAction !== 'none'}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
