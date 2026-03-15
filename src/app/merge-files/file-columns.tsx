import { Button } from '@/components/ui/button';
import { mixedThEnTextSort, numericStringSort } from '@/lib/table-sorted';
import { ColumnDef } from '@tanstack/react-table';
import { Download } from 'lucide-react';

export type FileItem = {
  attachmentId: string;
  filename: string;
  fullname: string;
  email: string;
  education_level: string;
  grad_year: string;
  course_code: string;
  course: string;
  course_name: string;
  milestone_step: string;
  enroll_date: string;
  file_url: string;
  reviewed_by: string;
};

type TranslationFunction = (key: string) => string;

export function createFileColumns(
  _handleDownload: (file: FileItem) => void,
  t?: TranslationFunction,
): ColumnDef<FileItem>[] {
  function getDownloadUrl(fileUrl: string) {
    if (!fileUrl) return '';
    const apiBase = process.env.NEXT_PUBLIC_API_URL || window.location.origin;
    if (
      fileUrl.startsWith('http://localhost') ||
      fileUrl.startsWith('https://localhost')
    ) {
      return fileUrl.replace(/https?:\/\/localhost(:\d+)?/, apiBase);
    }
    if (fileUrl.startsWith('/')) {
      return apiBase.replace(/\/$/, '') + fileUrl;
    }
    return fileUrl;
  }

  // ฟังก์ชันดาวน์โหลดไฟล์โดยตรง ไม่เปิดแท็บใหม่
  async function directDownload(file: FileItem) {
    if (!file.file_url) return;
    try {
      const url = getDownloadUrl(file.file_url);
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = file.filename || 'download';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
      }, 100);
    } catch (e) {
      alert('ไม่สามารถดาวน์โหลดไฟล์ได้');
    }
  }
  return [
    {
      accessorKey: 'filename',
      header: t ? t('merge-files.filename') : 'ชื่อไฟล์',
      sortingFn: mixedThEnTextSort<FileItem>(),
      cell: ({ row }: { row: { original: FileItem } }) => row.original.filename,
    },
    {
      accessorKey: 'fullname',
      header: t ? t('merge-files.fullname') : 'ชื่อ-นามสกุล',
      sortingFn: mixedThEnTextSort<FileItem>(),
      cell: ({ row }: { row: { original: FileItem } }) => row.original.fullname,
    },
    {
      accessorKey: 'email',
      sortingFn: 'alphanumeric',
      header: t ? t('merge-files.email') : 'อีเมล',
      cell: ({ row }: { row: { original: FileItem } }) => row.original.email,
    },
    {
      accessorKey: 'education_level',
      header: t ? t('merge-files.education_level') : 'ระดับการศึกษา',
      cell: ({ row }: { row: { original: FileItem } }) =>
        row.original.education_level,
    },
    {
      accessorKey: 'grad_year',
      header: t ? t('merge-files.grad_year') : 'ปีการศึกษา',
      sortingFn: numericStringSort<FileItem>(),
      cell: ({ row }: { row: { original: FileItem } }) =>
        row.original.grad_year,
    },
    {
      accessorKey: 'course',
      header: t ? t('merge-files.course') : 'หลักสูตร',
      sortingFn: mixedThEnTextSort<FileItem>(),
      cell: ({ row }: { row: { original: FileItem } }) => row.original.course,
    },
    {
      accessorKey: 'milestone_step',
      header: t ? t('merge-files.milestone_step') : 'ขั้นตอนการศึกษาย่อย',
      sortingFn: mixedThEnTextSort<FileItem>(),
      cell: ({ row }: { row: { original: FileItem } }) =>
        row.original.milestone_step,
    },
    {
      accessorKey: 'enroll_date',
      header: t ? t('merge-files.enroll_date') : 'วันที่ส่งหลักฐาน',
      sortingFn: 'datetime',
      cell: ({ row }: { row: { original: FileItem } }) =>
        row.original.enroll_date,
    },
    {
      accessorKey: 'reviewed_by',
      header: t ? t('merge-files.reviewed_by') : 'ผู้ตรวจสอบ',
      sortingFn: mixedThEnTextSort<FileItem>(),
      cell: ({ row }: { row: { original: FileItem } }) =>
        row.original.reviewed_by,
    },
    {
      accessorKey: 'actions',
      header: t ? t('merge-files.actions') : 'บันทึกไฟล์',
      cell: ({ row }: { row: { original: FileItem } }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => directDownload(row.original)}
        >
          <Download className="h-5 w-5" />
        </Button>
      ),
      enableSorting: false,
      enableColumnFilter: false,
    },
  ];
}
