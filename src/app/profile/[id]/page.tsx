'use client';

import { useTranslations } from 'next-intl';
import { Separator } from '@/components/ui/separator';
import MilestoneComponent from '@/components/milestone-progress/milestone-progress';
import { useEffect, useState } from 'react';
import { ProfileComponent } from '@/components/profile/profile';
import { UploadedFilesMap, ViewMode } from '@/types/milestone';
import { useMilestone } from '@/hooks/use-milestone';
import { useAuth } from '@/hooks/use-auth';
import useSWR from 'swr';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';

export default function ProfilePage() {
  const t = useTranslations('profile');
  const { user, initialized } = useAuth();
  const { fetchUserDetails, userMap } = useUser();
  const { fetchMilestonesWithStatus, milestoneMap } = useMilestone();
  const router = useRouter();
  const params = useParams();
  const rawId = params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const isOwnProfile = id === user?.id;
  const mode: ViewMode = isOwnProfile ? 'upload' : 'readonly';

  useEffect(() => {
    if (!isOwnProfile && id && !userMap[id]) {
      Promise.resolve(fetchUserDetails(id)).catch(() => {
        router.push(`/profile/${user?.id}`);
      });
    }
  }, [isOwnProfile, id, userMap, fetchUserDetails, router, user?.id]);

  const courseId = isOwnProfile ? user?.courseId : userMap[id ?? '']?.courseId;
  useSWR(
    courseId && id ? ['fetchMilestonesWithStatus', courseId, id] : null,
    courseId && id
      ? async () => {
          await fetchMilestonesWithStatus(courseId, id);
        }
      : null,
    {
      revalidateOnFocus: false,
    },
  );

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFilesMap>({});

  const handleFileUpload = (stepId: string, file: File) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [stepId]: file.name,
    }));
  };

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
      <div className="mb-4 text-2xl font-bold">{t('progress_title')}</div>
      <MilestoneComponent
        milestones={Object.values(milestoneMap)}
        mode={mode}
        enrollDate={profileEnrollDate}
        onFileUpload={handleFileUpload}
        uploadedFiles={uploadedFiles}
        userId={isOwnProfile ? user?.id : undefined}
      />
    </>
  );

  const renderTeacherView = () => (
    <>
      <Separator className="my-6" />
      <div className="mb-4 text-2xl font-bold">{t('progress_title')}</div>
      <label className="mr-4 font-medium">teacher</label>
    </>
  );

  return (
    <div>
      <ProfileComponent user={profileUser ?? null} isLoading={!initialized} />

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

      {/* Teacher */}
      {profileUser?.role === 'teacher' && renderTeacherView()}
    </div>
  );
}
