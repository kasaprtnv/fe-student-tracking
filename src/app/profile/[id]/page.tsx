'use client';

import { useTranslations } from 'next-intl';
import { Separator } from '@/components/ui/separator';
import MilestoneComponent from '@/components/milestone-progress/milestone-progress';
import { useEffect, useState, useCallback } from 'react';
import { ProfileComponent } from '@/components/profile/profile';
import { UploadedFilesMap, ViewMode } from '@/types/milestone';
import { useMilestone } from '@/hooks/use-milestone';
import { useAuth } from '@/hooks/use-auth';
import useSWR from 'swr';
import { notFound, useParams } from 'next/navigation';
import { useUser } from '@/hooks/use-user';

export default function ProfilePage() {
  const t = useTranslations('profile');
  const { user } = useAuth();
  const { fetchUserDetails, userMap } = useUser();
  const { fetchMilestonesWithStatus, milestoneMap } = useMilestone();
  const params = useParams();
  const rawId = params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const isOwnProfile = id === user?.id;
  const mode: ViewMode = isOwnProfile ? 'upload' : 'readonly';

  useEffect(() => {
    if (!isOwnProfile && id && !userMap[id]) {
      fetchUserDetails(id);
    }
  }, [isOwnProfile, id, userMap, fetchUserDetails]);

  const courseId = isOwnProfile ? user?.courseId : userMap[id ?? '']?.courseId;
  useSWR(
    courseId && id ? ['fetchMilestonesWithStatus', courseId, id] : null,
    courseId && id
      ? async () => {
          await fetchMilestonesWithStatus(courseId, id);
        }
      : null,
    {
      revalidateOnFocus: true, // Refresh เมื่อกลับมาที่หน้านี้
      refreshInterval: 30000, // Refresh ทุก 30 วินาที เพื่อให้เห็นการเปลี่ยนแปลงสถานะ
      onError: () => {
        if (!user && !userMap[id ?? '']) notFound();
      },
    },
  );

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFilesMap>({});

  const handleFileUpload = (stepId: string, file: File) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [stepId]: file.name,
    }));
  };

  // Callback หลังอัพโหลดสำเร็จ - refresh ข้อมูล milestone
  const handleSubmitSuccess = useCallback(async () => {
    // เคลียร์ไฟล์ที่อัพโหลด
    setUploadedFiles({});
    // Refresh ข้อมูล milestone เพื่ออัพเดทสถานะใหม่
    if (courseId && id) {
      await fetchMilestonesWithStatus(courseId, id);
    }
  }, [courseId, id, fetchMilestonesWithStatus]);

  return (
    <div>
      <ProfileComponent
        user={isOwnProfile ? (user ?? null) : (userMap[id ?? ''] ?? null)}
      />

      {isOwnProfile && user?.role === 'admin' ? (
        <div></div>
      ) : isOwnProfile && user?.role === 'student' ? (
        <div>
          <Separator className="my-6" />
          <div className="mb-4 text-2xl font-bold">{t('progress_title')}</div>
          <MilestoneComponent
            milestones={Object.values(milestoneMap)}
            mode={mode}
            enrollDate={user?.enrollDate}
            onFileUpload={handleFileUpload}
            onSubmitSuccess={handleSubmitSuccess}
            uploadedFiles={uploadedFiles}
            userId={user?.id}
          ></MilestoneComponent>
        </div>
      ) : !isOwnProfile && userMap[id ?? '']?.role === 'student' ? (
        <div>
          <Separator className="my-6" />
          <div className="mb-4 text-2xl font-bold">{t('progress_title')}</div>
          <MilestoneComponent
            milestones={Object.values(milestoneMap)}
            mode={mode}
            enrollDate={userMap[id ?? '']?.enrollDate}
            onFileUpload={handleFileUpload}
            onSubmitSuccess={handleSubmitSuccess}
            uploadedFiles={uploadedFiles}
          ></MilestoneComponent>
        </div>
      ) : isOwnProfile && user?.role === 'teacher' ? (
        <div>
          <Separator className="my-6" />
          <div className="mb-4 text-2xl font-bold">{t('progress_title')}</div>
          <label className="mr-4 font-medium">teacher</label>
        </div>
      ) : !isOwnProfile && userMap[id ?? '']?.role === 'teacher' ? (
        <div>
          <Separator className="my-6" />
          <div className="mb-4 text-2xl font-bold">{t('progress_title')}</div>
          <label className="mr-4 font-medium">teacher</label>
        </div>
      ) : null}
    </div>
  );
}
