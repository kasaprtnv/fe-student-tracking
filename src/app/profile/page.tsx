'use client';

import { useTranslations } from 'next-intl';
import { Separator } from '@/components/ui/separator';
import MilestoneComponent from '@/components/milestone-progress/milestone-progress';
import React, { useState } from 'react';
import { ProfileComponent } from '@/components/profile/profile';
import { Milestone, UploadedFilesMap } from '@/types/milestone';

const mockMilestones: Milestone[] = [
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
        dayPeriod: 7,
        isActive: true,
        status: 'approved',
      },
      {
        id: 'step-002',
        milestoneId: 'ms-thesis-001',
        position: 2,
        name: 'อาจารย์ที่ปรึกษาอนุมัติ',
        description: 'อาจารย์ที่ปรึกษาตรวจสอบและอนุมัติข้อเสนอโครงงาน',
        requiresAttachment: false,
        dayPeriod: 3,
        isActive: true,
        status: 'approved',
      },
      {
        id: 'step-003',
        milestoneId: 'ms-thesis-001',
        position: 3,
        name: 'อัปโหลดบทที่ 1',
        description: 'อัปโหลดบทที่ 1 (บทนำ) ที่เสร็จสมบูรณ์',
        requiresAttachment: true,
        dayPeriod: 10,
        isActive: true,
        status: 'pending',
      },
      {
        id: 'step-004',
        milestoneId: 'ms-thesis-001',
        position: 4,
        name: 'คณะกรรมการตรวจสอบ',
        description: 'คณะกรรมการตรวจสอบความคืบหน้าและให้ข้อเสนอแนะ',
        requiresAttachment: true,
        dayPeriod: 5,
        isActive: true,
        status: 'declined',
      },
      {
        id: 'step-005',
        milestoneId: 'ms-thesis-001',
        position: 5,
        name: 'สอบป้องกันวิทยานิพนธ์',
        description: 'นักศึกษาสอบป้องกันวิทยานิพนธ์ต่อคณะกรรมการ',
        requiresAttachment: true,
        dayPeriod: 15,
        isActive: true,
        status: 'available',
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
          mode="upload"
          onFileUpload={handleFileUpload}
          uploadedFiles={uploadedFiles}
        ></MilestoneComponent>
      </div>
    </div>
  );
}
