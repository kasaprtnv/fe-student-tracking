'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { useAuth } from '@/hooks/use-auth';
import { TeacherTable } from './teacher-table';
import { StudentTable } from './student-table';
import { AllTable } from './all-table';
import { PageHeader } from '../../../components/page-header';
import { ImportUsersDialog } from './import-users-dialog';
import { useCourse } from '@/hooks/use-course';

const UserPage = () => {
  const t = useTranslations('user-page');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, initialized } = useAuth();
  const { fetchAllUsers } = useUser();
  const { fetchAllCourses } = useCourse();
  const [isImportOpen, setIsImportOpen] = React.useState(false);

  // Get the tab from query params, default to 'all'
  const defaultTab = searchParams.get('tab') || 'all';

  useEffect(() => {
    if (!initialized) return;
    if (user && user.role !== 'admin') {
      router.replace(`/profile/${user.id}`);
    }
  }, [user, initialized, router]);

  useSWR(
    'fetch-users',
    async () => {
      await fetchAllCourses();
      await fetchAllUsers();
    },
    {
      revalidateOnFocus: false,
    },
  );

  const handleImportSuccess = async () => {
    // Refresh user list and courses after successful import
    await fetchAllUsers();
    await fetchAllCourses();

    // Dispatch event to notify tables to refetch their data
    window.dispatchEvent(new Event('user-imported'));
  };

  // Don't render anything until we confirm user is admin
  if (!initialized || !user || user.role !== 'admin') {
    return null;
  }

  return (
    <>
      <PageHeader breadcrumbs={[{ label: t('title'), isPage: true }]} />
      <div className="container mx-auto py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground">{t('description')}</p>
          </div>
          <Button onClick={() => setIsImportOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            {t('import-button')}
          </Button>
        </div>

        <Tabs defaultValue={defaultTab} className="w-full space-y-4">
          <TabsList>
            <TabsTrigger value="all">{t('tabs.all')}</TabsTrigger>
            <TabsTrigger value="students">{t('tabs.students')}</TabsTrigger>
            <TabsTrigger value="teachers">{t('tabs.teachers')}</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <AllTable />
          </TabsContent>
          <TabsContent value="students">
            <StudentTable />
          </TabsContent>
          <TabsContent value="teachers">
            <TeacherTable />
          </TabsContent>
        </Tabs>
      </div>

      <ImportUsersDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        onImportSuccess={handleImportSuccess}
      />
    </>
  );
};

export default UserPage;
