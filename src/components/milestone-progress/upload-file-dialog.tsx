import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import { IMilestoneStep } from '@/types/milestone-step';
import { useTranslations } from 'next-intl';

interface UploadFileDialogProps {
  userId?: string;
  step: IMilestoneStep;
  isUploading?: Record<string, boolean>;
  onFileUpload?: (stepId: string, file: File) => void;
}

export const UploadFileDialog = ({
  step,
  isUploading,
  onFileUpload,
}: UploadFileDialogProps) => {
  const t = useTranslations('milestone-progress');
  const [file, setFile] = useState<File[]>([]);
  const [open, setOpen] = useState(false);
  const limitFileSize = 20 * 1024 * 1024; // 20MB

  // คำนวณขนาดรวมไฟล์ทั้งหมด
  const getTotalFileSize = (files: File[]) =>
    files.reduce((acc, f) => acc + f.size, 0);

  // รองรับหลายไฟล์
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setFile((prev) => {
        // ป้องกันไฟล์ซ้ำ
        const newFiles = acceptedFiles.filter(
          (f) => !prev.some((pf) => pf.name === f.name && pf.size === f.size),
        );
        const allFiles = [...prev, ...newFiles];
        // ตรวจสอบขนาดรวม
        if (getTotalFileSize(allFiles) > limitFileSize) {
          return prev;
        }
        if (onFileUpload) {
          newFiles.forEach((f) => onFileUpload(step.id, f));
        }
        return allFiles;
      });
    },
    [onFileUpload, step.id, limitFileSize],
  );

  // ตรวจสอบขนาดรวมไฟล์ทั้งหมด
  const isLimitFileSize = () => getTotalFileSize(file) > limitFileSize;

  // สำหรับลบไฟล์ที่เลือก
  const handleRemoveFile = (name: string, size: number) => {
    setFile((prev) =>
      prev.filter((f) => !(f.name === name && f.size === size)),
    );
  };

  // เมื่อกดปุ่มอัปโหลด
  // const handleUpload = () => {
  //   if (file && onFileUpload) {
  //     onFileUpload(step.id, file);
  //     setFile(null);
  //     setOpen(false);
  //   }
  // };

  // เมื่อปิด dialog ให้ reset file
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setFile([]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpeg', '.jpg'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        ['.docx'],
    },
    maxSize: 20 * 1024 * 1024, // 20MB
    multiple: true,
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4" />
          {t('upload_button')}
        </Button>
      </DialogTrigger>
      <DialogContent className="md:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{t('upload_button')}</DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-xl">
          เลือกไฟล์ที่ต้องการอัปโหลด
        </DialogDescription>
        <div
          {...getRootProps()}
          className={
            'flex h-72 w-full cursor-pointer flex-col items-center justify-center border-2 border-dashed transition-colors ' +
            (isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-white')
          }
        >
          <input {...getInputProps()} />

          <div>
            <Upload className="mb-2 h-30 w-50 text-gray-400" />
          </div>
          <div className="flex w-full flex-col items-center gap-2">
            <span className="text-xl">
              {isDragActive
                ? 'ปล่อยไฟล์ที่นี่...'
                : 'ลากหรือคลิกเพื่ออัปโหลดไฟล์'}
            </span>
            <span className="text-sm text-gray-600">
              รองรับไฟล์ PDF, PNG, JPEG, JPG และ DOCX (ขนาดรวมไม่เกิน 20MB)
            </span>
          </div>
        </div>
        {file.length > 0 && (
          <div className="mt-4 w-full space-y-2">
            {file.map((f) => (
              <div
                key={f.name + f.size}
                className="flex w-full items-center justify-between rounded-md border bg-gray-300 p-4"
              >
                <span className="max-w-[550px] flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                  {f.name}
                </span>
                <X
                  className="size-5 text-red-500 hover:cursor-pointer"
                  onClick={() => handleRemoveFile(f.name, f.size)}
                />
              </div>
            ))}
          </div>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">ยกเลิก</Button>
          </DialogClose>
          <Button
            type="button"
            // onClick={handleUpload}
            disabled={
              file.length === 0 || isUploading?.[step.id] || isLimitFileSize()
            }
          >
            {isLimitFileSize()
              ? 'ขนาดไฟล์รวมเกิน 5MB'
              : isUploading?.[step.id]
                ? 'กำลังอัปโหลด...'
                : 'อัปโหลด'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
