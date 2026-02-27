import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Camera, UserCircle2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useUser } from '@/hooks/use-user';
import { useDropzone } from 'react-dropzone';

interface UploadProfileDialogProps {
  userId?: string;
  firstName?: string;
  lastName?: string;
}

export const UploadProfileDialog = ({
  userId,
  firstName,
  lastName,
}: UploadProfileDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);
  const { uploadProfileImage, getUserProfile } = useUser();

  // เพิ่มฟังก์ชัน onDrop
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles[0]) {
      setFile(acceptedFiles[0]);
    }
  };

  // ใช้งาน useDropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('profile', file);
    await uploadProfileImage({ id: userId || '', file });
    await getUserProfile();
    setOpen(false);
    setFile(null);
  };

  const clearFile = () => {
    setFile(null);
    setOpen(false);
  };

  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon-lg"
          className="rounded-full bg-red-800 hover:bg-red-300"
        >
          <Camera className="text-white" />
        </Button>
      </DialogTrigger>
      <DialogContent className="md:max-w-[750px]">
        <DialogHeader>
          <DialogTitle>แก้ไขรูปโปรไฟล์</DialogTitle>
        </DialogHeader>
        <div
          {...getRootProps()}
          className={`flex h-80 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}`}
        >
          <input {...getInputProps()} />
          {file ? (
            <>
              <Avatar className="mb-2 h-40 w-40">
                {previewUrl ? (
                  <AvatarImage
                    src={previewUrl}
                    alt="Profile preview"
                    className="object-cover"
                  />
                ) : (
                  <AvatarFallback>
                    {firstName?.[0]}
                    {lastName?.[0]}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="mb-2 overflow-hidden rounded-xl border bg-gray-300 px-4 py-2 text-center text-lg">
                {file.name}
              </div>
              <div>{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
            </>
          ) : (
            <>
              <UserCircle2 className="mb-2 h-24 w-24 text-gray-400" />
            </>
          )}
          <span>
            {!file && (
              <>
                <div className="mb-1 text-center text-lg">
                  {isDragActive
                    ? 'ปล่อยไฟล์ที่นี่...'
                    : 'ลากและปล่อยไฟล์ หรือคลิกเพื่อเลือกไฟล์'}
                </div>
                <div className="text-center text-sm text-gray-600">
                  รองรับไฟล์ PNG, JPG, JPEG (ขนาดไม่เกิน 5MB)
                </div>
              </>
            )}
          </span>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={clearFile}>
              ยกเลิก
            </Button>
          </DialogClose>
          <Button type="submit" onClick={handleUpload} disabled={!file}>
            บันทึก
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
