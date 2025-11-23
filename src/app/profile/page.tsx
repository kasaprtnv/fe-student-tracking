'use client';

import { useTranslations } from 'next-intl';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import MilestoneComponent from '@/components/milestone-progress/milestone-progress';
import React, { useState } from 'react';
import { ProfileComponent } from '@/components/profile/profile';
import { UploadedFilesMap } from '@/types/milestone';

const mockMilestones = [
  {
    id: 'ms-thesis-001',
    name: 'กระบวนการวิทยานิพนธ์',
    description: 'ขั้นตอนการส่งและป้องกันวิทยานิพนธ์',
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
    steps: [
      {
        id: 'step-001',
        milestoneId: 'ms-thesis-001',
        position: 1,
        name: 'ส่งข้อเสนอโครงงาน',
        description:
          'นักศึกษาส่งข้อเสนอโครงงานวิจัยพร้อมวัตถุประสงค์ วิธีการ และแผนดำเนินงาน',
        requiresAttachment: true,
        allowedFileTypes: '.pdf,.docx',
        deadlineDate: '2025-11-20',
        isActive: true,
        completed: true,
      },
      {
        id: 'step-002',
        milestoneId: 'ms-thesis-001',
        position: 2,
        name: 'อาจารย์ที่ปรึกษาอนุมัติ',
        description: 'อาจารย์ที่ปรึกษาตรวจสอบและอนุมัติข้อเสนอโครงงาน',
        requiresAttachment: false,
        deadlineDate: '2025-11-25',
        isActive: true,
        completed: true,
      },
      {
        id: 'step-003',
        milestoneId: 'ms-thesis-001',
        position: 3,
        name: 'อัปโหลดบทที่ 1',
        description: 'อัปโหลดบทที่ 1 (บทนำ) ที่เสร็จสมบูรณ์',
        requiresAttachment: true,
        allowedFileTypes: '.pdf,.docx',
        deadlineDate: '2025-12-10',
        isActive: true,
        completed: false,
      },
      {
        id: 'step-004',
        milestoneId: 'ms-thesis-001',
        position: 4,
        name: 'คณะกรรมการตรวจสอบ',
        description: 'คณะกรรมการตรวจสอบความคืบหน้าและให้ข้อเสนอแนะ',
        requiresAttachment: false,
        deadlineDate: '2025-12-20',
        isActive: true,
        completed: false,
      },
      {
        id: 'step-005',
        milestoneId: 'ms-thesis-001',
        position: 5,
        name: 'สอบป้องกันวิทยานิพนธ์',
        description: 'นักศึกษาสอบป้องกันวิทยานิพนธ์ต่อคณะกรรมการ',
        requiresAttachment: true,
        allowedFileTypes: '.pdf,.pptx',
        deadlineDate: '2026-01-15',
        isActive: true,
        completed: false,
      },
    ],
  },
  {
    id: 'ms-internship-001',
    name: 'โครงการฝึกงาน',
    description: 'ดำเนินการตามข้อกำหนดการฝึกงาน',
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
    steps: [
      {
        id: 'step-101',
        milestoneId: 'ms-internship-001',
        position: 1,
        name: 'หาสถานประกอบการ',
        description: 'ค้นหาและสมัครฝึกงานกับสถานประกอบการ',
        requiresAttachment: false,
        deadlineDate: '2025-11-30',
        isActive: true,
        completed: true,
      },
      {
        id: 'step-102',
        milestoneId: 'ms-internship-001',
        position: 2,
        name: 'ส่งสัญญาฝึกงาน',
        description: 'ส่งแบบฟอร์มสัญญาฝึกงานที่ลงนามแล้ว',
        requiresAttachment: true,
        allowedFileTypes: '.pdf',
        deadlineDate: '2025-12-05',
        isActive: true,
        completed: true,
      },
      {
        id: 'step-103',
        milestoneId: 'ms-internship-001',
        position: 3,
        name: 'รายงานประจำสัปดาห์',
        description: 'ส่งรายงานความคืบหน้าประจำสัปดาห์',
        requiresAttachment: true,
        allowedFileTypes: '.pdf,.docx',
        deadlineDate: '2026-01-31',
        isActive: true,
        completed: false,
      },
      {
        id: 'step-104',
        milestoneId: 'ms-internship-001',
        position: 4,
        name: 'รายงานสรุปผล',
        description: 'ส่งรายงานสรุปผลการฝึกงาน',
        requiresAttachment: true,
        allowedFileTypes: '.pdf,.docx',
        deadlineDate: '2026-02-15',
        isActive: true,
        completed: false,
      },
    ],
  },
  {
    id: 'ms-project-001',
    name: 'โครงงานจบการศึกษา',
    description: 'พัฒนาโครงงานในปีสุดท้าย',
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
    steps: [
      {
        id: 'step-201',
        milestoneId: 'ms-project-001',
        position: 1,
        name: 'เสนอหัวข้อโครงงาน',
        description: 'ส่งข้อเสนอโครงงานและรับการอนุมัติ',
        requiresAttachment: true,
        allowedFileTypes: '.pdf,.docx',
        deadlineDate: '2025-12-01',
        isActive: true,
        completed: false,
      },
      {
        id: 'step-202',
        milestoneId: 'ms-project-001',
        position: 2,
        name: 'นำเสนอผลงานต้นแบบ',
        description: 'นำเสนอผลงานต้นแบบต่ออาจารย์ที่ปรึกษา',
        requiresAttachment: false,
        deadlineDate: '2026-01-10',
        isActive: true,
        completed: false,
      },
      {
        id: 'step-203',
        milestoneId: 'ms-project-001',
        position: 3,
        name: 'นำเสนอรอบสุดท้าย',
        description: 'นำเสนอโครงงานที่เสร็จสมบูรณ์ต่อคณะกรรมการ',
        requiresAttachment: true,
        allowedFileTypes: '.pdf,.pptx',
        deadlineDate: '2026-02-20',
        isActive: true,
        completed: false,
      },
    ],
  },
];

export default function ProfilePage() {
  const t = useTranslations('profile');

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFilesMap>({});

  const handleFileUpload = (stepId: string, file: File) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [stepId]: file.name,
    }));
  };
  return (
    <div>
      <div className="mb-4 text-2xl font-bold">
        {t('personal_information.title')}
      </div>
      <ProfileComponent role="student" />
      <Separator className="my-6" />
      <div className="mb-4 text-2xl font-bold">{t('progress_title')}</div>
      <div>
        <MilestoneComponent
          milestones={mockMilestones}
          mode="readonly"
          onFileUpload={handleFileUpload}
          uploadedFiles={uploadedFiles}
        ></MilestoneComponent>
      </div>
    </div>
  );
}
