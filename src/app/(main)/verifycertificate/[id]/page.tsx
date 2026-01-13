'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { PageHeader } from '@/components/page-header';
import { Home } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ZoomIn,
  ZoomOut,
  Download,
  CheckCircle2,
  Upload,
  X,
} from 'lucide-react';
import { studentStepProgressService } from '@/services/student-step-progress.service';
import { uploadService, AttachmentDTO } from '@/services/upload.service';
import { IStudentStepProgress } from '@/types/student-step-progress';
import { useAuth } from '@/hooks/use-auth';
import { Spinner } from '@/components/ui/spinner';
import { usePendingCount } from '@/hooks/use-pending-count';

export default function VerifyDetailPage() {
  const t = useTranslations('verify-certificate');
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const { refresh: refreshPendingCount } = usePendingCount();
  const id = params.id as string;

  const [data, setData] = useState<IStudentStepProgress | null>(null);
  const [attachment, setAttachment] = useState<AttachmentDTO | null>(null);
  const [staffAttachment, setStaffAttachment] = useState<AttachmentDTO | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [declineReason, setDeclineReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [zoom, setZoom] = useState(100);

  // Staff attachment states
  const [staffAttachmentFile, setStaffAttachmentFile] = useState<File | null>(
    null,
  );
  const [uploadingStaffFile, setUploadingStaffFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // ดึงข้อมูล student step progress
        const response = await studentStepProgressService.getById(id);
        console.log('Detail API Response:', response);
        setData(response.data);

        // ดึงไฟล์แนบทั้งหมด
        try {
          const attachments = await uploadService.getAttachmentsByProgress(id);
          // DEBUG LOG: attachments array, studentId, รายละเอียดไฟล์แนบ
          console.log('DEBUG attachments (raw):', attachments);
          const studentId =
            response.data?.studentId || response.data?.student?.id;
          console.log('DEBUG studentId:', studentId);
          if (attachments && attachments.length > 0) {
            console.log(
              'DEBUG attachments summary:',
              attachments.map((a) => ({
                fileKey: a.fileKey,
                uploadedByUserId: a.uploadedByUserId,
                createdAt: a.createdAt,
              })),
            );
          } else {
            console.log('DEBUG attachments: ไม่มีไฟล์แนบ');
          }

          if (attachments && attachments.length > 0) {
            // ตรวจสอบ studentId และ uploadedByUserId
            const studentId =
              response.data?.studentId || response.data?.student?.id;
            console.log('studentId:', studentId);
            console.log(
              'attachments uploadedByUserId:',
              attachments.map((a) => a.uploadedByUserId),
            );
            // หาไฟล์ที่ student ส่ง (ไฟล์ล่าสุด)
            const studentSorted = [...attachments]
              .filter((att) => att.uploadedByUserId === studentId)
              .sort(
                (a, b) =>
                  new Date(b.createdAt || 0).getTime() -
                  new Date(a.createdAt || 0).getTime(),
              );
            const studentAttachment = studentSorted[0] || attachments[0];
            setAttachment(studentAttachment);

            // หา staff attachment (ไฟล์ที่ staff upload - uploadedByUserId ไม่ใช่ student)
            if (
              response.data?.status === 'declined' &&
              attachments.length > 1
            ) {
              const staffAtt = attachments.find(
                (att) => att.uploadedByUserId !== response.data?.studentId,
              );
              if (staffAtt) {
                setStaffAttachment(staffAtt);
              }
            }
          }
        } catch (attachError) {
          console.error('Error fetching attachments:', attachError);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleApprove = async () => {
    if (!user?.id) return;
    setSubmitting(true);
    try {
      await studentStepProgressService.approve(id, user.id);
      refreshPendingCount(); // Refresh pending count ทันที
      setSuccessMessage(t('success.approved'));
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error approving:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecline = async () => {
    if (!user?.id || !declineReason.trim()) return;
    setSubmitting(true);
    try {
      // Upload staff attachment if exists - ใช้ stepId จาก data
      if (staffAttachmentFile && data) {
        setUploadingStaffFile(true);
        try {
          // ใช้ stepId จาก data เพื่อ upload attachment
          const stepId = data.stepId || data.step?.id;
          if (stepId) {
            const uploadResult = await uploadService.uploadStaffAttachment(
              stepId,
              staffAttachmentFile,
              user.id,
            );
            if (!uploadResult.success) {
              console.warn(
                'Staff attachment upload failed:',
                uploadResult.error,
              );
            }
          } else {
            console.warn('No stepId found, skipping staff attachment upload');
          }
        } catch (uploadError) {
          console.warn('Staff attachment upload error:', uploadError);
        }
        setUploadingStaffFile(false);
      }

      await studentStepProgressService.decline(id, user.id, declineReason);
      refreshPendingCount(); // Refresh pending count ทันที
      setSuccessMessage(t('success.declined'));
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error declining:', error);
    } finally {
      setSubmitting(false);
      setUploadingStaffFile(false);
    }
  };

  // Handle staff file selection
  const handleStaffFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setStaffAttachmentFile(file);
    }
  };

  // Remove selected staff file
  const removeStaffFile = () => {
    setStaffAttachmentFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    router.push('/verifycertificate');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: '2-digit',
    });
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));

  const handleDownload = () => {
    const fileUrl = getFileUrl();
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };

  // Get the file URL for preview - ใช้ fileKey จาก attachment ที่ดึงมา
  const getFileUrl = () => {
    const fileKey =
      attachment?.fileKey ||
      attachment?.fileUrl ||
      data?.fileUrl ||
      data?.attachment?.fileUrl ||
      data?.attachment?.fileKey;

    if (!fileKey) return null;

    return uploadService.getFileUrl(fileKey);
  };

  // Get the file name for display
  const getFileName = () => {
    return (
      attachment?.fileName ||
      data?.fileName ||
      data?.attachment?.fileName ||
      'Document.pdf'
    );
  };

  // Check if file is an image
  const isImage = () => {
    const mimeType = attachment?.mimeType || '';
    const fileName = getFileName().toLowerCase();
    return (
      mimeType.startsWith('image/') ||
      fileName.endsWith('.jpg') ||
      fileName.endsWith('.jpeg') ||
      fileName.endsWith('.png') ||
      fileName.endsWith('.gif') ||
      fileName.endsWith('.webp')
    );
  };

  // Check if file is a PDF
  const isPdf = () => {
    const mimeType = attachment?.mimeType || '';
    const fileName = getFileName().toLowerCase();
    return mimeType === 'application/pdf' || fileName.endsWith('.pdf');
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p>{t('not_found')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: t('breadcrumb.verify'), href: '/verifycertificate' },
          { label: t('breadcrumb.detail'), isPage: true },
        ]}
      />

      {/* Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Document Preview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <CardTitle className="text-base font-medium">
                {getFileName()}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={handleZoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleZoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div
                className="flex items-center justify-center overflow-auto rounded-lg border bg-gray-50"
                style={{ height: '600px' }}
              >
                {getFileUrl() ? (
                  isImage() ? (
                    // แสดงรูปภาพ
                    <img
                      src={getFileUrl() || ''}
                      alt={getFileName()}
                      className="max-h-full max-w-full object-contain"
                      style={{
                        transform: `scale(${zoom / 100})`,
                        transformOrigin: 'center center',
                      }}
                    />
                  ) : isPdf() ? (
                    // แสดง PDF
                    <iframe
                      src={getFileUrl() || ''}
                      className="h-full w-full"
                      style={{
                        transform: `scale(${zoom / 100})`,
                        transformOrigin: 'top center',
                      }}
                      title="Document Preview"
                    />
                  ) : (
                    // ไฟล์ประเภทอื่น - แสดงลิงก์ดาวน์โหลด
                    <div className="flex flex-col items-center justify-center gap-4 text-center">
                      <p className="text-gray-600">{getFileName()}</p>
                      <Button onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" />
                        {t('download')}
                      </Button>
                    </div>
                  )
                ) : (
                  <div className="text-center text-gray-500">
                    <p>{t('no_document')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Details & Actions */}
        <div className="space-y-6">
          {/* Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t('detail.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">
                  {t('detail.student_code')}:
                </span>
                <span className="font-medium">
                  {data.studentCode || data.student?.code || '-'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">
                  {t('detail.student_name')}:
                </span>
                <span className="font-medium">
                  {data.studentName ||
                    `${data.student?.firstName || ''} ${data.student?.lastName || ''}`.trim() ||
                    '-'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">
                  {t('detail.step')}:
                </span>
                <span className="font-medium">
                  {data.stepName || data.step?.name || '-'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">
                  {t('detail.submit_date')}:
                </span>
                <span className="font-medium">
                  {formatDate(data.submittedAt)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Review Card */}
          {data.status === 'pending approval' && (
            <Card>
              <CardHeader>
                <CardTitle>{t('review.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="declineReason">
                    {t('review.decline_reason')}
                  </Label>
                  <Textarea
                    id="declineReason"
                    placeholder={t('review.decline_reason_placeholder')}
                    value={declineReason}
                    maxLength={1000}
                    onChange={(e) => {
                      const value = e.target.value.slice(0, 1000);
                      setDeclineReason(value);
                    }}
                    className="mt-2"
                    rows={4}
                  />
                  <p className="text-muted-foreground mt-1 text-right text-xs">
                    {declineReason.length}/1000
                  </p>
                </div>

                {/* Staff Attachment Upload */}
                <div>
                  <Label>{t('review.staff_attachment')}</Label>
                  <div
                    className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 transition-colors hover:border-gray-400"
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        setStaffAttachmentFile(e.dataTransfer.files[0]);
                      }
                    }}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    {staffAttachmentFile ? (
                      <div className="flex w-full items-center justify-between rounded-md bg-gray-50 p-3">
                        <span className="truncate text-sm">
                          {staffAttachmentFile.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeStaffFile();
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="mb-2 h-8 w-8 text-gray-400" />
                        <p className="text-center text-sm text-gray-500">
                          {t('review.click_to_upload')}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          PDF, docx, PNG
                          <br />
                          <span className="block text-xs text-gray-400">
                            ลากไฟล์มาวางที่นี่ได้
                          </span>
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={handleStaffFileChange}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={handleDecline}
                    disabled={
                      submitting || uploadingStaffFile || !declineReason.trim()
                    }
                  >
                    {submitting || uploadingStaffFile ? (
                      <Spinner className="mr-2 h-4 w-4" />
                    ) : null}
                    {t('review.decline')}
                  </Button>
                  <Button
                    onClick={handleApprove}
                    disabled={submitting}
                    className="bg-black hover:bg-gray-900"
                  >
                    {submitting ? <Spinner className="mr-2 h-4 w-4" /> : null}
                    {t('review.approve')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Already Reviewed */}
          {data.status !== 'pending approval' && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {data.status === 'approved'
                    ? t('already_approved')
                    : t('already_declined')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Staff Attachment - เอกสารที่แนบมา */}
                {(staffAttachment || data.staffAttachment) && (
                  <div>
                    <Label className="text-muted-foreground">
                      {t('detail.staff_attachment')}
                    </Label>
                    <div className="mt-2 flex items-center justify-between rounded-lg border bg-gray-50 p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {staffAttachment?.fileName ||
                            data.staffAttachment?.fileName ||
                            'Document'}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          const fileKey =
                            staffAttachment?.fileKey ||
                            staffAttachment?.fileUrl ||
                            data.staffAttachment?.fileKey ||
                            data.staffAttachment?.fileUrl;
                          if (fileKey) {
                            window.open(
                              uploadService.getFileUrl(fileKey),
                              '_blank',
                            );
                          }
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Decline Reason - เหตุผลในการปฏิเสธ */}
                {data.declineReason && (
                  <div>
                    <Label className="text-red-500">
                      {t('detail.decline_reason')}
                    </Label>
                    <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-3">
                      <p className="text-sm text-red-700">
                        {data.declineReason}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Success Modal */}
      <AlertDialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              {t('success.title')}
            </AlertDialogTitle>
            <AlertDialogDescription>{successMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handleSuccessClose}
              className="bg-black hover:bg-black"
            >
              {t('success.ok')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
