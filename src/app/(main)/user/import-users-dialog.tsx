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
import { Upload, FileSpreadsheet, X, Loader, Download } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { userService } from '@/services/user.service';
import * as XLSX from 'xlsx';
import { useCourse } from '@/hooks/use-course';

interface ImportUsersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess?: () => void;
}

interface ImportResult {
  success: boolean;
  message?: string;
  data?: {
    success?: number;
    failed?: number;
    skipped?: number;
    updated?: number;
    errors?: string[];
  };
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

  // Use course hook to get course data for courseName to courseId mapping
  const { courseMap, allCourseId, fetchAllCourses } = useCourse();

  // Fetch courses when dialog opens
  React.useEffect(() => {
    if (open && allCourseId.length === 0) {
      fetchAllCourses();
    }
  }, [open, allCourseId.length, fetchAllCourses]);

  // Create courseName to courseId mapping
  const getCourseIdByName = React.useCallback(
    (courseName: string): string | undefined => {
      const normalizedName = courseName.trim().toLowerCase();
      for (const courseId of allCourseId) {
        const course = courseMap[courseId];
        if (course && course.name.toLowerCase() === normalizedName) {
          return courseId;
        }
      }
      return undefined;
    },
    [courseMap, allCourseId],
  );

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

  const handleDownloadTemplate = () => {
    // Define the headers for the template
    const headers = [
      'email',
      'title',
      'firstName',
      'lastName',
      'phone',
      'role',
      'code',
      'degree',
      'year',
      'courseName',
      'enrollDate',
    ];

    // Create a worksheet with just the headers
    const worksheet = XLSX.utils.aoa_to_sheet([headers]);

    // Set column widths for better readability
    worksheet['!cols'] = headers.map(() => ({ wch: 15 }));

    // Create a workbook and add the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

    // Generate and download the file
    XLSX.writeFile(workbook, 'user_import_template.xlsx');
    toast.success(t('toast.template-downloaded'));
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error(t('errors.no-file-selected'));
      return;
    }

    setIsUploading(true);
    try {
      // Read the Excel file
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert to JSON array
      const jsonData =
        XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

      // Map courseName to courseId if courseName exists
      const processedData = jsonData.map((row) => {
        const newRow: Record<string, unknown> = {};

        // Trim all string values to remove whitespace/tabs
        for (const [key, value] of Object.entries(row)) {
          if (typeof value === 'string') {
            newRow[key] = value.trim();
          } else {
            newRow[key] = value;
          }
        }

        // If courseName exists and courseId doesn't, try to find courseId
        if (newRow.courseName && !newRow.courseId) {
          const courseId = getCourseIdByName(String(newRow.courseName));
          if (courseId) {
            newRow.courseId = courseId;
          } else {
            // Store invalid course name for error reporting
            newRow.__invalidCourseName = newRow.courseName;
          }
          delete newRow.courseName; // Remove courseName as backend expects courseId
        }

        return newRow;
      });

      // Create a new worksheet with processed data
      const newWorksheet = XLSX.utils.json_to_sheet(processedData);
      const newWorkbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Users');

      // Generate new Excel file as blob
      const excelBuffer = XLSX.write(newWorkbook, {
        bookType: 'xlsx',
        type: 'array',
      });
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const processedFile = new File([blob], file.name, { type: blob.type });

      // Upload the processed file
      const result = (await userService.importUsers(
        processedFile,
      )) as unknown as ImportResult;

      if (result.success) {
        const failedCount = result.data?.failed || 0;

        toast.success(t('toast.import-success'));

        if (failedCount > 0) {
          toast.warning(t('toast.import-partial', { failed: failedCount }));

          // Show each error message
          const errors = result.data?.errors || [];
          errors.forEach((error) => {
            // Clean up the error message (remove leading tabs/whitespace)
            const cleanError = error.trim();
            toast.error(cleanError, { duration: 8000 });
          });
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
          {/* Download Template Button */}
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
              className="text-blue-600 hover:text-blue-700"
            >
              <Download className="mr-2 h-4 w-4" />
              {t('download-template')}
            </Button>
          </div>

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
