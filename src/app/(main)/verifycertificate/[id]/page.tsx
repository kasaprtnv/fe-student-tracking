'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
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
  // Grouped attachments by batch
  const [studentAttachments, setStudentAttachments] = useState<AttachmentDTO[]>(
    [],
  );
  const [attachmentBatches, setAttachmentBatches] = useState<AttachmentDTO[][]>(
    [],
  );
  const [selectedAttachmentIdx, setSelectedAttachmentIdx] = useState(0);
  const [staffAttachment, setStaffAttachment] = useState<AttachmentDTO | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [declineReason, setDeclineReason] = useState('');
  const [declineReasonError, setDeclineReasonError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [zoom, setZoom] = useState(100);

  // Staff attachment states
  const [staffAttachmentFiles, setStaffAttachmentFiles] = useState<File[]>([]);
  const [uploadingStaffFile, setUploadingStaffFile] = useState(false);
  const [fileTypeError, setFileTypeError] = useState(false);
  const [fileSizeError, setFileSizeError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Student comment
  const [studentComment, setStudentComment] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // ดึงข้อมูล student step progress
        const response = await studentStepProgressService.getById(id);
        setData(response.data);

        // ดึงไฟล์แนบตาม attempt ล่าสุด
        try {
          const studentId =
            response.data?.studentId || response.data?.student?.id;
          // ดึงไฟล์ทั้งหมดก่อน
          const allAttachments =
            await uploadService.getAttachmentsByProgress(id);

          // ดึง attempts เพื่อ log ดูข้อมูล
          try {
            const attemptsRes =
              await studentStepProgressService.getAttemptsByProgressId(id);
            if (
              attemptsRes.data &&
              Array.isArray(attemptsRes.data) &&
              attemptsRes.data.length > 0
            ) {
              // เอา attempt ที่มี attemptNo สูงสุด
              const sortedAttempts = [...attemptsRes.data].sort((a, b) => {
                return (b.attemptNo || 0) - (a.attemptNo || 0);
              });
              const latestAttempt = sortedAttempts[0] as unknown as Record<
                string,
                unknown
              >;
            }
          } catch {
            // ถ้าดึง attempts ไม่ได้
          }

          // ขั้นตอน 1: ดึง attempt ล่าสุดเพื่อหา staffAttachmentId (ไฟล์ที่ต้องกรองออก)
          const staffAttachmentIds: string[] = [];
          let studentFiles: AttachmentDTO[] = [];

          try {
            const attemptsRes2 =
              await studentStepProgressService.getAttemptsByProgressId(id);
            if (
              attemptsRes2.data &&
              Array.isArray(attemptsRes2.data) &&
              attemptsRes2.data.length > 0
            ) {
              // เก็บ staffAttachmentId ทั้งหมดเพื่อกรองออก
              attemptsRes2.data.forEach((attempt) => {
                if (attempt.staffAttachmentId) {
                  staffAttachmentIds.push(attempt.staffAttachmentId);
                }
              });

              // เอา attempt ที่มี attemptNo สูงสุด
              const sortedAttempts = [...attemptsRes2.data].sort((a, b) => {
                return (b.attemptNo || 0) - (a.attemptNo || 0);
              });
              const latestAttempt = sortedAttempts[0];
            }
          } catch (err) {
            console.error('Error getting attempts:', err);
          }

          // ขั้นตอน 2: กรองไฟล์โดยเอาไฟล์ที่เป็น staffAttachmentId ออก และกรองโดย uploadedByUserId
          const filesExcludingStaff = (allAttachments || []).filter((att) => {
            // กรองออกถ้า id ตรงกับ staffAttachmentId
            if (att.id && staffAttachmentIds.includes(att.id)) {
              return false;
            }
            // กรองออกถ้า uploadedByUserId ไม่ใช่ของนิสิต (เป็นของ staff/admin)
            // ถ้ามี studentId ให้เก็บเฉพาะไฟล์ที่ uploadedByUserId ตรงกับ studentId
            if (studentId) {
              if (!att.uploadedByUserId || att.uploadedByUserId !== studentId) {
                return false;
              }
            }
            return true;
          });

          // ขั้นตอน 3: หา attemptId ล่าสุดจากไฟล์ที่เหลือ
          if (filesExcludingStaff.length > 0) {
            // หา attemptId ล่าสุดจากไฟล์ (ใช้เวลาสร้าง)
            const filesWithAttemptId = filesExcludingStaff.filter(
              (att) => att.attemptId,
            );

            if (filesWithAttemptId.length > 0) {
              // หา attemptId ที่ล่าสุด
              const sortedByTime = [...filesWithAttemptId].sort(
                (a, b) =>
                  new Date(b.createdAt || 0).getTime() -
                  new Date(a.createdAt || 0).getTime(),
              );
              const latestAttemptIdFromFiles =
                sortedByTime[0].attemptId || null;

              if (latestAttemptIdFromFiles) {
                // Filter ไฟล์ที่มี attemptId ตรงกัน
                studentFiles = filesExcludingStaff.filter(
                  (att) => att.attemptId === latestAttemptIdFromFiles,
                );
              }
            } else {
              // ถ้าไม่มี attemptId ใช้เวลาล่าสุด
              const latestTime = Math.max(
                ...filesExcludingStaff.map((f) =>
                  new Date(f.createdAt || 0).getTime(),
                ),
              );
              const BATCH_WINDOW_MS = 1 * 60 * 1000; // 1 minute
              studentFiles = filesExcludingStaff.filter((f) => {
                const fileTime = new Date(f.createdAt || 0).getTime();
                return latestTime - fileTime <= BATCH_WINDOW_MS;
              });
            }
          }

          // sort ล่าสุดไว้หน้าแรก
          studentFiles.sort(
            (a, b) =>
              new Date(b.createdAt || 0).getTime() -
              new Date(a.createdAt || 0).getTime(),
          );
          setStudentAttachments(studentFiles);
          setSelectedAttachmentIdx(0);

          // --- Group attachments by attemptId (or fallback to latest submission time) ---
          const batches: AttachmentDTO[][] = [];

          // ตรวจสอบว่ามี attemptId หรือไม่
          const hasAttemptId = studentFiles.some((att) => att.attemptId);

          if (hasAttemptId) {
            // Group by attemptId - วิธีที่ถูกต้อง
            const attemptGroups = new Map<string, AttachmentDTO[]>();
            studentFiles.forEach((att) => {
              const attemptKey = att.attemptId || 'unknown';
              if (!attemptGroups.has(attemptKey)) {
                attemptGroups.set(attemptKey, []);
              }
              attemptGroups.get(attemptKey)!.push(att);
            });
            // แปลงเป็น array และ sort โดย attempt ล่าสุดไว้ก่อน
            const groupArray = Array.from(attemptGroups.entries());
            groupArray.sort((a, b) => {
              const aTime = Math.max(
                ...a[1].map((att) => new Date(att.createdAt || 0).getTime()),
              );
              const bTime = Math.max(
                ...b[1].map((att) => new Date(att.createdAt || 0).getTime()),
              );
              return bTime - aTime; // newest first
            });
            groupArray.forEach(([, files]) => batches.push(files));
          } else {
            // Fallback: Group by batch start time (แก้ไขให้เปรียบเทียบกับเวลาเริ่มต้นของ batch)
            let currentBatch: AttachmentDTO[] = [];
            let batchStartTime: number | null = null;
            const BATCH_WINDOW_MS = 5 * 60 * 1000; // 5 minutes (เพิ่มเป็น 5 นาทีเพื่อรองรับการอัปโหลดหลายไฟล์)
            studentFiles.forEach((att) => {
              const attTime = new Date(att.createdAt || 0).getTime();
              if (
                batchStartTime === null ||
                Math.abs(batchStartTime - attTime) > BATCH_WINDOW_MS
              ) {
                if (currentBatch.length > 0) batches.push(currentBatch);
                currentBatch = [att];
                batchStartTime = attTime; // ใช้เวลาของไฟล์แรกเป็น batch start
              } else {
                currentBatch.push(att);
              }
            });
            if (currentBatch.length > 0) batches.push(currentBatch);
          }

          setAttachmentBatches(batches);

          // หา staff attachment (ไฟล์ที่ staff upload - uploadedByUserId ไม่ใช่ student)
          // ดึงไฟล์ทั้งหมดสำหรับหา staff attachment
          if (response.data?.status === 'declined') {
            try {
              const allAttachments =
                await uploadService.getAttachmentsByProgress(id);
              if (allAttachments.length > 1) {
                const staffAtt = allAttachments.find(
                  (att: AttachmentDTO) => att.uploadedByUserId !== studentId,
                );
                if (staffAtt) setStaffAttachment(staffAtt);
              }
            } catch {
              // ignore
            }
          }
        } catch (attachError) {
          console.error('Error fetching attachments:', attachError);
        }

        // ดึง studentComment จาก attempts (ตาราง student_step_attempt)
        try {
          const attemptsResponse =
            await studentStepProgressService.getAttemptsByProgressId(id);
          if (attemptsResponse.data && attemptsResponse.data.length > 0) {
            // เอา attempt ล่าสุด
            const latestAttempt =
              attemptsResponse.data[attemptsResponse.data.length - 1];
            if (latestAttempt.studentComment) {
              setStudentComment(latestAttempt.studentComment);
            }
          }
        } catch {
          // fallback: ลองดึงจาก data โดยตรง
          if (response.data?.studentComment) {
            setStudentComment(response.data.studentComment);
          }
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
      // ส่งไฟล์แนบไปพร้อมกับ approve เพื่อให้ backend สร้าง attempt และเชื่อมโยง staff_attachment_id
      await studentStepProgressService.approve(
        id,
        user.id,
        declineReason,
        staffAttachmentFiles.length > 0 ? staffAttachmentFiles : undefined,
      );
      refreshPendingCount(); // Refresh pending count ทันที
      setSuccessMessage(t('success.approved'));
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error approving:', error);
    } finally {
      setSubmitting(false);
      setUploadingStaffFile(false);
    }
  };

  const handleDecline = async () => {
    if (!user?.id) return;

    // ตรวจสอบว่ากรอกความคิดเห็นหรือยัง
    if (!declineReason.trim()) {
      setDeclineReasonError(true);
      return;
    }

    setSubmitting(true);
    try {
      // ส่งไฟล์ทั้งหมดไปให้ backend สร้างหลาย attempt (แต่ละ attempt ชี้ไปทีละไฟล์)
      await studentStepProgressService.decline(
        id,
        user.id,
        declineReason,
        staffAttachmentFiles.length > 0 ? staffAttachmentFiles : undefined,
      );
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
  const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.png', '.jpg', '.jpeg'];
  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

  const isValidFileType = (file: File): boolean => {
    const fileName = file.name.toLowerCase();
    return ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext));
  };

  const isValidFileSize = (file: File): boolean => {
    return file.size <= MAX_FILE_SIZE;
  };

  const handleStaffFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const allFiles = Array.from(files);

      // ตรวจสอบประเภทไฟล์
      const validTypeFiles = allFiles.filter(isValidFileType);
      const invalidTypeFiles = allFiles.filter((f) => !isValidFileType(f));

      if (invalidTypeFiles.length > 0) {
        setFileTypeError(true);
        setTimeout(() => setFileTypeError(false), 3000);
      }

      // ตรวจสอบขนาดไฟล์
      const validFiles = validTypeFiles.filter(isValidFileSize);
      const oversizedFiles = validTypeFiles.filter((f) => !isValidFileSize(f));

      if (oversizedFiles.length > 0) {
        setFileSizeError(true);
        setTimeout(() => setFileSizeError(false), 3000);
      }

      if (validFiles.length > 0) {
        setStaffAttachmentFiles((prev) => [...prev, ...validFiles]);
      }
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove selected staff file by index
  const removeStaffFile = (index: number) => {
    setStaffAttachmentFiles((prev) => prev.filter((_, i) => i !== index));
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
      year: 'numeric',
    });
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));

  // Helper function สำหรับแก้ไขชื่อไฟล์ภาษาไทยที่ encode ผิด (Mojibake)
  const decodeFileName = (name: string): string => {
    if (!name) return 'Document.pdf';
    try {
      // ตรวจสอบว่าเป็น mojibake หรือไม่ (มีตัวอักษรแปลกๆ เช่น Ã, à)
      if (/[\xC0-\xFF]/.test(name) && !/[\u0E00-\u0E7F]/.test(name)) {
        // ลอง decode จาก Latin-1 เป็น UTF-8
        const bytes = new Uint8Array([...name].map((c) => c.charCodeAt(0)));
        const decoded = new TextDecoder('utf-8').decode(bytes);
        if (/[\u0E00-\u0E7F]/.test(decoded)) {
          return decoded;
        }
      }
      return name;
    } catch {
      return name;
    }
  };

  // Helpers for selected batch & file
  // Always show only the latest batch
  const selectedBatch = attachmentBatches[0] || [];
  const selectedAttachment = selectedBatch[selectedAttachmentIdx] || null;
  const getFileUrl = () => {
    if (!selectedAttachment) return null;
    const fileKey = selectedAttachment.fileKey || selectedAttachment.fileUrl;
    if (!fileKey) return null;
    return uploadService.getFileUrl(fileKey);
  };
  const getFileName = () =>
    decodeFileName(selectedAttachment?.fileName || 'Document.pdf');
  const isImage = () => {
    if (!selectedAttachment) return false;
    const mimeType = selectedAttachment.mimeType || '';
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
  const isPdf = () => {
    if (!selectedAttachment) return false;
    const mimeType = selectedAttachment.mimeType || '';
    const fileName = getFileName().toLowerCase();
    return mimeType === 'application/pdf' || fileName.endsWith('.pdf');
  };
  const handleDownload = () => {
    const fileUrl = getFileUrl();
    const fileName = getFileName();
    if (fileUrl) {
      fetch(fileUrl)
        .then((response) => {
          if (!response.ok) throw new Error('Network response was not ok');
          return response.blob();
        })
        .then((blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
          }, 100);
        })
        .catch((error) => {
          console.error('Download error:', error);
        });
    }
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
    <>
      <PageHeader
        breadcrumbs={[
          { label: t('breadcrumb.verify'), href: '/verifycertificate' },
          { label: t('breadcrumb.detail'), isPage: true },
        ]}
      />

      <div className="container mx-auto pt-2 pb-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">{t('breadcrumb.detail')}</h1>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Document Preview (with batch & file tabs) */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-col gap-2 border-b pb-4">
                {/* File tab bar - แสดงเฉพาะเมื่อมีไฟล์มากกว่า 1 ไฟล์ */}
                {studentAttachments.length > 0 &&
                  (attachmentBatches[0] || []).length > 1 && (
                    <div className="mb-2 flex items-center gap-2 overflow-x-auto">
                      {(attachmentBatches[0] || []).map((att, idx) => (
                        <button
                          key={att.id || att.fileKey || idx}
                          className={`max-w-[200px] flex-shrink-0 truncate rounded-t border-b-2 px-3 py-1 text-sm font-medium transition-colors ${selectedAttachmentIdx === idx ? 'border-red-500 bg-white text-red-700' : 'border-transparent bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                          onClick={() => setSelectedAttachmentIdx(idx)}
                          type="button"
                          title={decodeFileName(
                            att.fileName || `ไฟล์ที่ ${idx + 1}`,
                          )}
                        >
                          {decodeFileName(att.fileName || `ไฟล์ที่ ${idx + 1}`)}
                        </button>
                      ))}
                    </div>
                  )}
                <div className="flex w-full items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <CardTitle className="text-base font-medium">
                      {studentAttachments.length > 0
                        ? getFileName()
                        : t('no_attachment')}
                    </CardTitle>
                    {data?.step?.requiresAttachment === false && (
                      <span className="text-xs text-gray-500">
                        {t('no_attachment_required')}
                      </span>
                    )}
                  </div>
                  {studentAttachments.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleZoomIn}
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleZoomOut}
                      >
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDownload}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div
                  className="flex items-center justify-center overflow-auto rounded-lg border bg-gray-50"
                  style={{ height: '600px' }}
                >
                  {studentAttachments.length > 0 ? (
                    getFileUrl() ? (
                      isImage() ? (
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
                    )
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 text-center text-gray-500">
                      <p className="text-lg font-medium">
                        {t('no_attachment_description')}
                      </p>
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
                <div className="flex gap-2">
                  <span className="text-muted-foreground whitespace-nowrap">
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

            {/* Student Comment Card - คำอธิบายเพิ่มเติมจากนักศึกษา */}
            <Card>
              <CardHeader>
                <CardTitle>{t('detail.student_comment')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border bg-gray-50 p-4">
                  <p className="text-sm whitespace-pre-wrap">
                    {studentComment || '-'}
                  </p>
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
                        if (value.trim()) {
                          setDeclineReasonError(false);
                        }
                      }}
                      className={`mt-2 ${declineReasonError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                      rows={4}
                    />
                    <div className="mt-1 flex justify-between">
                      {declineReasonError ? (
                        <p className="text-xs text-red-500">
                          {t('review.decline_reason_required')}
                        </p>
                      ) : (
                        <span />
                      )}
                      <p className="text-muted-foreground text-xs">
                        {declineReason.length}/1000
                      </p>
                    </div>
                  </div>

                  {/* Staff Attachment Upload */}
                  <div>
                    <Label>{t('review.staff_attachment')}</Label>
                    <div
                      className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 transition-colors hover:border-gray-400"
                      onClick={() => fileInputRef.current?.click()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (
                          e.dataTransfer.files &&
                          e.dataTransfer.files.length > 0
                        ) {
                          const allFiles = Array.from(e.dataTransfer.files);

                          // ตรวจสอบประเภทไฟล์
                          const validTypeFiles =
                            allFiles.filter(isValidFileType);
                          const invalidTypeFiles = allFiles.filter(
                            (f) => !isValidFileType(f),
                          );

                          if (invalidTypeFiles.length > 0) {
                            setFileTypeError(true);
                            setTimeout(() => setFileTypeError(false), 3000);
                          }

                          // ตรวจสอบขนาดไฟล์
                          const validFiles =
                            validTypeFiles.filter(isValidFileSize);
                          const oversizedFiles = validTypeFiles.filter(
                            (f) => !isValidFileSize(f),
                          );

                          if (oversizedFiles.length > 0) {
                            setFileSizeError(true);
                            setTimeout(() => setFileSizeError(false), 3000);
                          }

                          if (validFiles.length > 0) {
                            setStaffAttachmentFiles((prev) => [
                              ...prev,
                              ...validFiles,
                            ]);
                          }
                        }
                      }}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      <Upload className="mb-2 h-8 w-8 text-gray-400" />
                      <p className="text-center text-sm text-gray-500">
                        {t('review.click_to_upload')}
                      </p>
                      <p className="mt-1 text-center text-xs text-gray-400">
                        {t('review.file_types')}
                      </p>
                    </div>
                    {/* File type error message */}
                    {fileTypeError && (
                      <p className="mt-2 text-sm text-red-500">
                        {t('review.invalid_file_type')}
                      </p>
                    )}
                    {/* File size error message */}
                    {fileSizeError && (
                      <p className="mt-2 text-sm text-red-500">
                        {t('review.file_too_large')}
                      </p>
                    )}
                    {/* Selected files list */}
                    {staffAttachmentFiles.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {staffAttachmentFiles.map((file, index) => (
                          <div
                            key={`${file.name}-${index}`}
                            className="flex items-center justify-between rounded-md bg-gray-50 p-3"
                          >
                            <span className="truncate text-sm">
                              {file.name}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeStaffFile(index);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,.png,.jpg,.jpeg"
                      className="hidden"
                      onChange={handleStaffFileChange}
                      multiple
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={handleDecline}
                      disabled={submitting || uploadingStaffFile}
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
          <AlertDialogContent className="max-w-sm">
            <AlertDialogTitle className="sr-only">
              {t('success.title')}
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
                {t('success.title')}
              </h2>
              <p className="text-center text-gray-600">{successMessage}</p>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
