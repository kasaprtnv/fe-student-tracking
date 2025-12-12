'use client';

import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface DeleteConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  title: string;
  description: string;
  translationKey: string;
  count?: number;
}

const DeleteConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  isLoading,
  title,
  description,
  translationKey,
  count,
}: DeleteConfirmationDialogProps) => {
  const t = useTranslations(translationKey);
  const tCommon = useTranslations('common');
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t(title)}</AlertDialogTitle>
          <AlertDialogDescription>
            {typeof count === 'number' ? t(description, { count }) : t(description)}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>
            {tCommon('cancel')}
          </AlertDialogCancel>
          <Button
            disabled={isLoading}
            onClick={onConfirm}
            variant="destructive"
          >
            {isLoading && (
              <Loader className="mr-2 size-4 animate-spin" aria-hidden="true" />
            )}
            {tCommon('delete')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmationDialog;
