'use client';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { DataTableClickable } from '@/components/data-table/data-table-clickable';
import { createFileColumns, FileItem } from './file-columns';
import { PageHeader } from '@/components/page-header';
import { studentStepProgressService } from '@/services/student-step-progress.service';
import { IStudentStepProgress } from '@/types/student-step-progress';
import { useTranslations, useLocale } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { formatDateByLocale } from '@/lib/format-date';
import { uploadService } from '@/services/upload.service';
import DeleteConfirmationDialog from '@/components/delete-dialog';
import { toast } from 'sonner';

function mapDegree(degree?: string) {
  switch (degree) {
    case 'bachelor':
      return 'ปริญญาตรี';
    case 'master':
      return 'ปริญญาโท';
    case 'doctorate':
      return 'ปริญญาเอก';
    default:
      return degree || '-';
  }
}

function mapYear(year?: string) {
  if (!year || year === '-') return '-';
  if (/^\d+$/.test(year)) return `${year}`;
  return year;
}

export default function FileListPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [filesToDelete, setFilesToDelete] = useState<FileItem[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Flatten progress records to file items (1 row = 1 file)
  const transformToFileItems = (item: IStudentStepProgress): FileItem[] => {
    const studentName =
      item.studentName ||
      (item.student
        ? `${item.student.firstName} ${item.student.lastName}`
        : '-');
    const studentCode = item.studentCode || item.student?.code || '-';
    const courseName = item.courseName || item.student?.courseName || '-';
    const stepName = item.stepName || item.step?.name || '-';

    const degreeRaw =
      item.studentDegree ?? item.degree ?? item.student?.degree ?? '-';
    const yearRaw = item.studentYear ?? item.year ?? item.student?.year ?? '-';
    const educationLevel = mapDegree(degreeRaw);
    const gradYear = mapYear(yearRaw);

    // Base file item data (shared across attachments)
    const baseItem = {
      fullname: studentName,
      email: `${studentCode}@go.buu.ac.th`,
      education_level: educationLevel,
      grad_year: gradYear,
      course: courseName,
      course_name: courseName,
      milestone_step: stepName,
      enroll_date: item.submittedAt
        ? formatDateByLocale(item.submittedAt, locale)
        : '-',
    };

    // If attachments array exists, flatten to multiple rows
    if (item.attachments && item.attachments.length > 0) {
      type AttachmentWithDeleted = (typeof item.attachments)[number] & {
        isDeleted?: boolean;
      };
      const activeAttachments = (
        item.attachments as AttachmentWithDeleted[]
      ).filter((a) => !a.isDeleted);
      return activeAttachments.map((attachment) => ({
        ...baseItem,
        attachmentId: attachment.attachmentId || '',
        filename: attachment.fileName || '-',
        file_url: attachment.fileUrl || attachment.fileKey || '',
      }));
    }

    // Fallback to single attachment or fileName field
    const fileName = item.fileName || item.attachment?.fileName || '-';
    const fileUrl =
      item.fileUrl ||
      item.fileKey ||
      item.attachment?.fileUrl ||
      item.attachment?.fileKey ||
      '';
    const attachmentId = item.attachment?.id || '';

    return [
      {
        ...baseItem,
        attachmentId,
        filename: fileName,
        file_url: fileUrl,
      },
    ];
  };

  // ดึงข้อมูลไฟล์ที่อนุมัติแล้ว
  const fetchApprovedFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await studentStepProgressService.getAll({
        status: 'approved',
      });

      if (response?.data) {
        // Flatten: 1 progress with N attachments = N rows
        const transformedFiles = response.data.flatMap(transformToFileItems);
        setFiles(transformedFiles);
      }
    } catch (err) {
      console.error('Error fetching approved files:', err);
      setError(t('merge-files.error-loading'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchApprovedFiles();
  }, [fetchApprovedFiles]);

  // จัดการดาวน์โหลดไฟล์
  function handleDownload(file: FileItem) {
    if (file.file_url) {
      const url = file.file_url.startsWith('http')
        ? file.file_url
        : uploadService.getFileUrl(file.file_url);
      window.open(url, '_blank');
    }
  }

  // กรองข้อมูลตามการค้นหา
  const displayFiles = useMemo(() => {
    if (!searchQuery) return files;
    const lowerQuery = searchQuery.toLowerCase();
    return files.filter(
      (file) =>
        file.filename?.toLowerCase().includes(lowerQuery) ||
        file.fullname?.toLowerCase().includes(lowerQuery) ||
        file.email?.toLowerCase().includes(lowerQuery) ||
        file.course?.toLowerCase().includes(lowerQuery) ||
        file.milestone_step?.toLowerCase().includes(lowerQuery) ||
        file.education_level?.toLowerCase().includes(lowerQuery) ||
        file.grad_year?.toLowerCase().includes(lowerQuery),
    );
  }, [files, searchQuery]);

  // จัดการลบไฟล์หลายรายการ
  const handleMultiDelete = (selectedFiles: FileItem[]) => {
    setFilesToDelete(selectedFiles);
    setDeleteDialogOpen(true);
  };

  // ยืนยันการลบ
  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      // ลบทีละไฟล์
      const deletePromises = filesToDelete
        .filter((file) => file.attachmentId) // กรองเฉพาะไฟล์ที่มี attachmentId
        .map((file) => uploadService.deleteAttachment(file.attachmentId));

      const results = await Promise.allSettled(deletePromises);

      // ตรวจสอบว่ามีไฟล์ใดลบไม่สำเร็จ
      const failedCount = results.filter(
        (r) =>
          r.status === 'rejected' ||
          (r.status === 'fulfilled' && !r.value.success),
      ).length;

      const successCount = results.length - failedCount;

      if (failedCount > 0) {
        toast.error(
          t('merge-files.toast.deleteFailed', { count: failedCount }),
        );
      }

      if (successCount > 0) {
        toast.success(
          t('merge-files.toast.deleteSuccess', { count: successCount }),
        );
      }

      // รีเฟรชข้อมูล
      await fetchApprovedFiles();
    } catch (err) {
      console.error('Error deleting files:', err);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setFilesToDelete([]);
    }
  };

  // สร้าง unique id สำหรับแต่ละ row
  const getRowId = (file: FileItem) =>
    file.attachmentId || `${file.filename}-${file.email}`;

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center p-6">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
        <span className="ml-2">{t('merge-files.loading')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <PageHeader
          breadcrumbs={[{ label: t('homepage.mergeFiles'), isPage: true }]}
        />
        <div className="border-destructive/50 bg-destructive/10 text-destructive mt-6 rounded-lg border p-4 text-center">
          {error}
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: t('homepage.mergeFiles'), isPage: true }]}
      />
      <div className="container mx-auto pt-2 pb-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">{t('merge-files.title')}</h1>
          <p className="text-muted-foreground">
            {t('merge-files.description')}
          </p>
        </div>
        <DataTableClickable
          columns={createFileColumns(handleDownload, t)}
          data={displayFiles}
          onSearch={setSearchQuery}
          searchQuery={searchQuery}
          enabledPagination={true}
          onMultiDelete={handleMultiDelete}
          getRowId={getRowId}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setFilesToDelete([]);
        }}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="delete-title"
        description="delete-description"
        translationKey="merge-files"
        count={filesToDelete.length}
      />
    </>
  );
}
