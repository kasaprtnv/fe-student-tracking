import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export type FileItem = {
  filename: string;
  fullname: string;
  email: string;
  education_level: string;
  grad_year: string;
  course: string;
  course_name: string;
  milestone_step: string;
  enroll_date: string;
  file_url: string;
};

type TranslationFunction = (key: string) => string;

export function createFileColumns(
  _handleDownload: (file: FileItem) => void,
  t?: TranslationFunction,
) {
  // ฟังก์ชันดาวน์โหลดไฟล์โดยตรง ไม่เปิดแท็บใหม่
  async function directDownload(file: FileItem) {
    if (!file.file_url) return;
    try {
      const url = file.file_url.startsWith('http')
        ? file.file_url
        : (await import('@/services/upload.service')).uploadService.getFileUrl(
            file.file_url,
          );

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
      cell: ({ row }: { row: { original: FileItem } }) => row.original.filename,
    },
    {
      accessorKey: 'fullname',
      header: t ? t('merge-files.fullname') : 'ชื่อ-นามสกุล',
      cell: ({ row }: { row: { original: FileItem } }) => row.original.fullname,
    },
    {
      accessorKey: 'email',
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
      header: t ? t('merge-files.grad_year') : 'ระดับชั้นปี',
      cell: ({ row }: { row: { original: FileItem } }) =>
        row.original.grad_year,
    },
    {
      accessorKey: 'course',
      header: t ? t('merge-files.course') : 'หลักสูตร',
      cell: ({ row }: { row: { original: FileItem } }) => row.original.course,
    },
    {
      accessorKey: 'course_name',
      header: t ? t('merge-files.course_name') : 'ชื่อหลักสูตร',
      cell: ({ row }: { row: { original: FileItem } }) =>
        row.original.course_name,
    },
    {
      accessorKey: 'milestone_step',
      header: t ? t('merge-files.milestone_step') : 'ขั้นตอน',
      cell: ({ row }: { row: { original: FileItem } }) =>
        row.original.milestone_step,
    },
    {
      accessorKey: 'enroll_date',
      header: t ? t('merge-files.enroll_date') : 'วันที่ส่ง',
      cell: ({ row }: { row: { original: FileItem } }) =>
        row.original.enroll_date,
    },
    {
      accessorKey: 'actions',
      header: t ? t('merge-files.actions') : 'ดาวน์โหลด',
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
