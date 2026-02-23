'use client';

import { useTranslations } from 'next-intl';
import { Separator } from '@/components/ui/separator';
import MilestoneComponent from '@/components/milestone-progress/milestone-progress';
import { useEffect, useState, useCallback } from 'react';
import { ProfileStudentComponent } from '@/components/profile/profile-student';
import { UploadedFilesMap, ViewMode } from '@/types/milestone';
import { useMilestone } from '@/hooks/use-milestone';
import { useAuth } from '@/hooks/use-auth';
import useSWR from 'swr';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { PageHeader } from '@/components/page-header';
import { ProfileTeacherComponent } from '@/components/profile/profile-teacher';
import { useAttempt } from '@/hooks/use-attempt';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const t = useTranslations('profile');
  const tStudent = useTranslations('student-page');
  const { user, initialized } = useAuth();
  const { fetchUserDetails, userMap } = useUser();
  const { fetchMilestonesWithStatus, milestoneMap } = useMilestone();
  const { getAttemptByUserId, stepAttemptsMap } = useAttempt();
  const router = useRouter();
  const params = useParams();
  const rawId = params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const isOwnProfile = id === user?.id;
  const mode: ViewMode = isOwnProfile ? 'upload' : 'readonly';

  const breadcrumb = isOwnProfile
    ? [
        {
          label: t('personal_information.title'),
          isPage: true,
        },
      ]
    : [
        {
          label: tStudent('title'),
          isPage: true,
        },
        {
          label: tStudent('personal-information-student'),
          isPage: true,
        },
      ];

  useEffect(() => {
    if (!isOwnProfile && id && !userMap[id]) {
      Promise.resolve(fetchUserDetails(id)).catch(() => {
        router.push(`/profile/${user?.id}`);
      });
    }
  }, [isOwnProfile, id, userMap, fetchUserDetails, router, user?.id]);

  useSWR(
    user?.role === 'student' && user?.id
      ? ['getStudentStepAttempts', user.id]
      : null,
    user?.role === 'student' && user?.id
      ? async () => {
          await getAttemptByUserId(user?.id ?? '');
        }
      : null,
    {
      revalidateOnFocus: true, // Refresh เมื่อกลับมาที่หน้านี้
      refreshInterval: 30000, // Refresh ทุก 30 วินาที เพื่อให้เห็นการเปลี่ยนแปลงสถานะ
    },
  );

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
  const profileUser = isOwnProfile ? user : userMap[id ?? ''];
  const profileCourseId = isOwnProfile
    ? user?.courseId
    : userMap[id ?? '']?.courseId;
  const profileEnrollDate = isOwnProfile
    ? user?.enrollDate
    : userMap[id ?? '']?.enrollDate;

  const renderMilestones = () => (
    <>
      <Separator className="my-6" />
      <div className="mb-4 flex items-center justify-between">
        <div className="text-2xl font-bold">{t('progress_title')}</div>

        {/* Export PDF: student only */}
        {profileUser?.role === 'student' && (
          <Button
            variant="outline"
            onClick={() => window.open(`/profile/${id}/pdf`, '_blank')}
          >
            Export PDF
          </Button>
        )}
      </div>
      <MilestoneComponent
        milestones={Object.values(milestoneMap)}
        stepAttempts={Object.values(stepAttemptsMap)}
        mode={mode}
        enrollDate={profileEnrollDate}
        onFileUpload={handleFileUpload}
        onSubmitSuccess={handleSubmitSuccess}
        uploadedFiles={uploadedFiles}
        userId={isOwnProfile ? user?.id : undefined}
      />
    </>
  );

  return (
    <div>
      <PageHeader breadcrumbs={breadcrumb} />
      {/* Student */}
      {profileUser?.role === 'student' && (
        <ProfileStudentComponent
          user={profileUser ?? null}
          isLoading={!initialized}
          isOwnProfile={isOwnProfile}
        />
      )}

      {/* Teacher */}
      {profileUser?.role === 'teacher' && (
        <ProfileTeacherComponent
          user={profileUser ?? null}
          isLoading={!initialized}
        />
      )}

      {/* Admin - no progress */}
      {profileUser?.role === 'admin' && null}

      {/* Student without course */}
      {profileUser?.role === 'student' && !profileCourseId && (
        <>
          <Separator className="my-6" />
          <div>
            <span className="text-lg font-medium">{t('contact_admin')}</span>
          </div>
        </>
      )}

      {/* Student with course */}
      {profileUser?.role === 'student' && profileCourseId && renderMilestones()}
    </div>
  );
}
