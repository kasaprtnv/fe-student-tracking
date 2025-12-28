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
import { Camera } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useUser } from '@/hooks/use-user';

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>อัปโหลดรูปโปรไฟล์</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center gap-2">
          {/* Avatar Preview */}
          <Avatar className="h-40 w-40">
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
        </div>
        <Input
          className="profile"
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          onChange={handleFileChange}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={clearFile}>
              ยกเลิก
            </Button>
          </DialogClose>
          <Button type="submit" onClick={handleUpload}>
            ยืนยัน
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
