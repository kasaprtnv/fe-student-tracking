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
import { useUser } from '@/hooks/use-user';
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
  const [file, setFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);
  const [internalFiles, setInternalFiles] = useState<Record<string, File>>({});
  const [internalFileNames, setInternalFileNames] = useState<
    Record<string, string>
  >({});

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setInternalFiles((prev) => ({ ...prev, [step.id]: file }));
        setInternalFileNames((prev) => ({ ...prev, [step.id]: file.name }));
        setFile(file);
        if (onFileUpload) {
          onFileUpload(step.id, file);
        }
      }
    },
    [onFileUpload, step.id],
  );

  // สำหรับลบไฟล์ที่เลือก
  const handleRemoveFile = () => {
    setFile(null);
  };

  // เมื่อกดปุ่มอัปโหลด
  const handleUpload = () => {
    if (file && onFileUpload) {
      onFileUpload(step.id, file);
      setFile(null);
      setOpen(false);
    }
  };

  // เมื่อปิด dialog ให้ reset file
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setFile(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        ['.docx'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
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
              รองรับไฟล์ PDF และ DOCX (ขนาดไม่เกิน 5MB)
            </span>
          </div>
        </div>
        {file && (
          <div className="flex w-full items-center justify-between rounded-lg bg-gray-100 px-4 py-4">
            <span className="text-base text-wrap">{file.name}</span>
            <button
              type="button"
              className="ml-2 rounded p-1 hover:bg-red-100"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFile();
              }}
              aria-label="ลบไฟล์"
            >
              <X className="h-5 w-5 text-red-500 hover:cursor-pointer" />
            </button>
          </div>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">ยกเลิก</Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleUpload}
            disabled={!file || isUploading?.[step.id]}
          >
            {isUploading?.[step.id] ? 'กำลังอัปโหลด...' : 'อัปโหลด'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
