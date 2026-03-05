import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authService } from '@/services/auth.service';
import { CheckCircle2, ShieldAlert, ShieldCheck, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export const ChangePasswordComponent = () => {
  const t = useTranslations('profile.change_password');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSave = async () => {
    if (newPassword !== confirmNewPassword) {
      setError('รหัสผ่านใหม่และยืนยันรหัสผ่านใหม่ไม่ตรงกัน');
      return;
    }
    setError('');
    if (
      currentPassword.trim() !== '' &&
      newPassword.trim() !== '' &&
      confirmNewPassword.trim() !== ''
    ) {
      const result = await authService.changePassword(
        currentPassword,
        newPassword,
      );
      if (!result.success) {
        setError(result.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
      } else {
        setSuccessMessage('รหัสผ่านถูกเปลี่ยนเรียบร้อยแล้ว');
        setShowSuccessModal(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
  };
  return (
    <>
      <div className="w-11/12">
        <div className="rounded-3xl border bg-white px-14 py-6">
          {/* Header */}
          <div className="mb-6 border-l-4 border-red-600 pl-4">
            <h2 className="text-2xl font-bold text-gray-900">{t('title')}</h2>
          </div>

          <div className="mb-6 grid grid-cols-12 gap-6">
            {/* รหัสผ่านเดิม */}
            <div className="col-span-5 flex flex-col gap-2">
              <label className="flex items-center gap-2 text-base font-medium text-gray-700">
                <ShieldAlert className="h-5 w-5 text-red-600" />
                {t('current_password')}
              </label>
              <Input
                type="password"
                placeholder={t('current_password')}
                className="bg-red-50/50 p-5"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Password Fields */}
          <div className="grid grid-cols-12 gap-6">
            {/* เปลี่ยนรหัสผ่านใหม่ */}
            <div className="col-span-5 flex flex-col gap-2">
              <label className="flex items-center gap-2 text-base font-medium text-gray-700">
                <ShieldAlert className="h-5 w-5 text-red-600" />
                {t('new_password')}
              </label>
              <Input
                type="password"
                placeholder={t('new_password')}
                className="bg-red-50/50 p-5"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            {/* ยืนยันรหัสผ่านใหม่ */}
            <div className="col-span-5 col-start-8 flex flex-col gap-2">
              <label className="flex items-center gap-2 text-base font-medium text-gray-700">
                <ShieldCheck className="h-5 w-5 text-red-600" />
                {t('confirm_new_password')}
              </label>
              <Input
                type="password"
                placeholder={t('confirm_new_password')}
                className="bg-red-50/50 p-5"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-8 flex justify-end gap-3">
            <Button variant="outline" className="px-8">
              {t('cancel')}
            </Button>
            <Button
              className="bg-black px-8 hover:bg-gray-800"
              onClick={handleSave}
            >
              {t('save')}
            </Button>
          </div>
          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>
        {/* Success Modal */}
        <AlertDialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
          <AlertDialogContent className="max-w-sm">
            <AlertDialogTitle className="sr-only">
              {t('success')}
            </AlertDialogTitle>
            <button
              onClick={handleSuccessClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex flex-col items-center justify-center py-6">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
                <CheckCircle2 className="h-10 w-10 text-white" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-green-500">
                {t('success')}
              </h2>
              <p className="text-center text-gray-600">{successMessage}</p>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
};
