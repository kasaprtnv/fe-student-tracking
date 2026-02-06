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
    hasValidationErrors?: boolean;
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

  // Create courseName/courseCode to courseId mapping
  // Accepts either course name or course code
  const getCourseIdByNameOrCode = React.useCallback(
    (courseNameOrCode: string): string | undefined => {
      const normalizedInput = courseNameOrCode.trim().toLowerCase();
      for (const courseId of allCourseId) {
        const course = courseMap[courseId];
        if (course) {
          // Match by name or code
          if (
            course.name.toLowerCase() === normalizedInput ||
            course.code.toLowerCase() === normalizedInput
          ) {
            return courseId;
          }
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
      if (droppedFile.size > 5 * 1024 * 1024) {
        toast.error(t('errors.file-too-large', { size: '5MB' }));
        return;
      }
      setFile(droppedFile);
    } else {
      toast.error(t('errors.invalid-file-type'));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && isExcelFile(selectedFile)) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error(t('errors.file-too-large', { size: '5MB' }));
        // Reset input so user can select same file again if they really want to rely on backend (though we block it here) or select another
        e.target.value = '';
        return;
      }
      setFile(selectedFile);
    } else {
      // toast.error(t('errors.invalid-file-type')); // Optional: existing behavior just ignores or toasts?
      // Existing code toasts:
      if (selectedFile) toast.error(t('errors.invalid-file-type'));
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

  const handleDownloadStudentTemplate = () => {
    // Student template headers
    const headers = [
      'คำนำหน้า',
      'ชื่อ',
      'นามสกุล',
      'อีเมล',
      'รหัสนิสิต',
      'เบอร์โทรศัพท์',
      'ระดับการศึกษา',
      'ปีการศึกษา',
      'รหัสหลักสูตร',
      'แผนการเรียน',
      'วันที่ลงทะเบียน',
    ];

    // Create a worksheet with just the headers
    const worksheet = XLSX.utils.aoa_to_sheet([headers]);

    // Set column widths for better readability
    worksheet['!cols'] = headers.map(() => ({ wch: 20 }));

    // Create a workbook and add the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');

    // Generate and download the file
    XLSX.writeFile(workbook, 'student_import_template.xlsx');
    toast.success(t('toast.template-downloaded'));
  };

  const handleDownloadTeacherTemplate = () => {
    // Teacher template headers
    const headers = [
      'คำนำหน้า',
      'ชื่อ',
      'นามสกุล',
      'อีเมล',
      'เบอร์โทรศัพท์',
      'วุฒิการศึกษา',
      'รหัสหลักสูตร',
      'ตำแหน่งทางวิชาการ',
    ];

    // Create a worksheet with just the headers
    const worksheet = XLSX.utils.aoa_to_sheet([headers]);

    // Set column widths for better readability
    worksheet['!cols'] = headers.map(() => ({ wch: 20 }));

    // Create a workbook and add the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Teachers');

    // Generate and download the file
    XLSX.writeFile(workbook, 'teacher_import_template.xlsx');
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

      // Thai to English header mapping
      const thaiToEnglishMap: Record<string, string> = {
        อีเมล: 'email',
        คำนำหน้า: 'title',
        ชื่อ: 'firstName',
        นามสกุล: 'lastName',
        เบอร์โทร: 'phone',
        เบอร์โทรศัพท์: 'phone',
        บทบาท: 'role',
        รหัส: 'code',
        รหัสนักศึกษา: 'code',
        รหัสนิสิต: 'code',
        ระดับการศึกษา: 'degree',
        ปีการศึกษา: 'year',
        ชื่อหลักสูตร: 'courseName',
        รหัสหลักสูตร: 'courseName',
        'ชื่อหลักสูตร/รหัสหลักสูตร': 'courseName',
        วันที่ลงทะเบียน: 'enrollDate',
        แผนการเรียน: 'studyPlan',
        วุฒิการศึกษาอาจารย์: 'teacherDegree',
        วุฒิการศึกษา: 'teacherDegree',
        ตำแหน่งทางวิชาการ: 'academicPosition',
      };

      // Map courseName to courseId and convert Thai keys to English
      const processedData = jsonData.map((row) => {
        const newRow: Record<string, unknown> = {};

        // Convert Thai keys to English and trim all string values
        for (const [key, value] of Object.entries(row)) {
          const englishKey = thaiToEnglishMap[key] || key;
          if (typeof value === 'string') {
            newRow[englishKey] = value.trim();
          } else {
            newRow[englishKey] = value;
          }
        }

        // If courseName exists and courseId doesn't, try to find courseId(s)
        if (newRow.courseName && !newRow.courseId) {
          const courseNamesOrCodes = String(newRow.courseName)
            .split(',')
            .map((c) => c.trim())
            .filter((c) => c.length > 0);

          if (courseNamesOrCodes.length > 0) {
            const courseIds: string[] = [];
            const invalidCourseNames: string[] = [];

            for (const nameOrCode of courseNamesOrCodes) {
              const courseId = getCourseIdByNameOrCode(nameOrCode);
              if (courseId) {
                courseIds.push(courseId);
              } else {
                invalidCourseNames.push(nameOrCode);
              }
            }

            // If we have valid course IDs, use them
            if (courseIds.length > 0) {
              // For single course, use courseId (backward compatible)
              // For multiple courses, use courseIds array
              if (courseIds.length === 1) {
                newRow.courseId = courseIds[0];
              } else {
                newRow.courseIds = courseIds;
              }
            }

            // Store invalid course names for error reporting
            if (invalidCourseNames.length > 0) {
              newRow.__invalidCourseName = invalidCourseNames.join(', ');
            }
          }
          delete newRow.courseName; // Remove courseName as backend expects courseId/courseIds
        }

        return newRow;
      });

      // Convert arrays to comma-separated strings for Excel compatibility
      const excelCompatibleData = processedData.map((row) => {
        const newRow = { ...row };
        // Convert courseIds array to comma-separated string
        if (newRow.courseIds && Array.isArray(newRow.courseIds)) {
          newRow.courseIds = newRow.courseIds.join(',');
        }
        return newRow;
      });

      // Create a new worksheet with processed data
      const newWorksheet = XLSX.utils.json_to_sheet(excelCompatibleData);
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

        if (failedCount === 0) {
          toast.success(t('toast.import-success'));
        }

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
      } else if (result.data?.hasValidationErrors) {
        // File has invalid rows — entire file is rejected
        toast.error(t('toast.import-failed'));

        const errors = result.data?.errors || [];
        errors.forEach((error) => {
          const cleanError = error.trim();
          toast.error(cleanError, { duration: 8000 });
        });

        // Keep the dialog open so user can fix the file
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
          {/* Download Template Buttons */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadStudentTemplate}
            >
              <Download className="mr-2 h-4 w-4" />
              {t('download-student-template')}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadTeacherTemplate}
            >
              <Download className="mr-2 h-4 w-4" />
              {t('download-teacher-template')}
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
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
              <FileSpreadsheet className="h-8 w-8 text-green-600" />
              <div className="min-w-0">
                <p
                  className="truncate text-sm font-medium text-gray-900"
                  title={file.name}
                >
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
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
