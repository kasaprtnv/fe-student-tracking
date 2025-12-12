'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet, X, Loader } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { userService } from '@/services/user.service';

interface ImportUsersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess?: () => void;
}

export function ImportUsersDialog({
  open,
  onOpenChange,
  onImportSuccess,
}: ImportUsersDialogProps) {
  const t = useTranslations('user.import-dialog');
  const tCommon = useTranslations('common');

  const [file, setFile] = React.useState<File | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && isExcelFile(droppedFile)) {
      setFile(droppedFile);
    } else {
      toast.error(t('errors.invalid-file-type'));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && isExcelFile(selectedFile)) {
      setFile(selectedFile);
    } else {
      toast.error(t('errors.invalid-file-type'));
    }
  };

  const isExcelFile = (file: File) => {
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    const validExtensions = ['.xlsx', '.xls'];
    return (
      validTypes.includes(file.type) ||
      validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))
    );
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error(t('errors.no-file-selected'));
      return;
    }

    setIsUploading(true);
    try {
      const result: any = await userService.importUsers(file);

      if (result.success) {
        const successCount = result.data?.success || 0;
        const failedCount = result.data?.failed || 0;

        toast.success(t('toast.import-success', { count: successCount }));

        if (failedCount > 0) {
          toast.warning(t('toast.import-partial', { failed: failedCount }));
        }

        setFile(null);
        onOpenChange(false);
        onImportSuccess?.();
      } else {
        toast.error(result.message || t('toast.import-failed'));
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error(t('toast.import-failed'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setFile(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drag & Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            } `}
          >
            <Upload className="mb-4 h-12 w-12 text-gray-400" />
            <p className="mb-2 text-sm font-medium text-gray-700">
              {t('drag-drop-text')}
            </p>
            <p className="text-xs text-gray-500">{t('file-format')}</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Selected File */}
          {file && (
            <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
          >
            {tCommon('cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleUpload}
            disabled={!file || isUploading}
          >
            {isUploading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            {t('upload-button')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
