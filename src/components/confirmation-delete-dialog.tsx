'use client';

import React, { use, useState } from 'react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface DeleteTextConfirmationDialogProps
  extends React.ComponentPropsWithRef<typeof AlertDialog> {
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  confirmText: string;
  isLoading?: boolean;
  destructiveButtonText?: string;
  cancelButtonText?: string;
  warningText?: string;
  minWidth?: string;
}

export const DeleteTextConfirmationDialog = ({
  onConfirm,
  title = 'Delete Item?',
  description = 'This action cannot be undone. This will permanently delete the item.',
  confirmText,
  isLoading = false,
  destructiveButtonText = 'Delete',
  cancelButtonText = 'Cancel',
  warningText,
  minWidth = 'min-w-[520px]',
  ...props
}: DeleteTextConfirmationDialogProps) => {
  const tComponent = useTranslations(
    'components.delete-text-confirmation-dialog',
  );
  const [inputValue, setInputValue] = useState<string>('');
  const [isConfirmEnabled, setIsConfirmEnabled] = useState<boolean>(false);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setIsConfirmEnabled(value === confirmText);
  };

  const handleConfirm = async () => {
    if (isConfirmEnabled && !isLoading) {
      try {
        await onConfirm();
        setInputValue('');
        setIsConfirmEnabled(false);
      } catch (error) {
        console.error('Confirm action failed:', error);
      }
    }
  };

  const handleCancel = () => {
    setInputValue('');
    setIsConfirmEnabled(false);
  };

  const displayConfirmText = confirmText || 'CONFIRM';

  return (
    <AlertDialog {...props}>
      <AlertDialogContent className={minWidth}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <div>
          <span className="mb-2 block text-sm">
            {tComponent('confirmation-text', { text: displayConfirmText })}
          </span>
          <Input
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={displayConfirmText}
            disabled={isLoading}
            autoFocus
          />
        </div>
        {warningText && (
          <div>
            <p className="ml-3 text-sm text-red-700">{warningText}</p>
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isLoading}>
            {cancelButtonText}
          </AlertDialogCancel>
          <Button
            disabled={!isConfirmEnabled || isLoading}
            onClick={handleConfirm}
            variant="destructive"
          >
            {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            {destructiveButtonText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
