'use client';

import { useTranslations } from 'next-intl';
import { Separator } from '@/components/ui/separator';
import MilestoneComponent from '@/components/milestone-progress/milestone-progress';
import { useState } from 'react';
import { ProfileComponent } from '@/components/profile/profile';
import { UploadedFilesMap, ViewMode } from '@/types/milestone';
import { useMilestone } from '@/hooks/use-milestone';
import { useAuth } from '@/hooks/use-auth';
import useSWR from 'swr';
import { useParams } from 'next/navigation';

export default function ProfilePage() {
  const t = useTranslations('profile');
  const params = useParams();
  const { user } = useAuth();
  const { fetchMilestonesWithStatus, milestoneMap } = useMilestone();
  const isOwnProfile = params.id === user?.id;
  const mode: ViewMode = isOwnProfile ? 'upload' : 'readonly';

  useSWR(
    user ? ['fetchMilestonesWithStatus', user.courseId, user.id] : null,
    async () => {
      await fetchMilestonesWithStatus(user?.courseId || '', user?.id || '');
    },
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

  return (
    <div>
      <div className="mb-4 text-2xl font-bold">
        {t('personal_information.title')}
      </div>
      <ProfileComponent user={user} />
      <Separator className="my-6" />
      <div className="mb-4 text-2xl font-bold">{t('progress_title')}</div>
      {user?.role === 'admin' ? (
        <div>
          <label className="mr-4 font-medium">admin</label>
        </div>
      ) : (
        <div>
          <MilestoneComponent
            milestones={Object.values(milestoneMap)}
            mode={mode}
            onFileUpload={handleFileUpload}
            uploadedFiles={uploadedFiles}
          ></MilestoneComponent>
        </div>
      )}
    </div>
  );
}
