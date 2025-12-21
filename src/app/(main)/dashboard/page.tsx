'use client';

import * as React from 'react';
import useSWR from 'swr';
import { useTranslations } from 'next-intl';
import { useUser } from '@/hooks/use-user';
import { useCourse } from '@/hooks/use-course';
import { useDashboard } from '@/hooks/use-dashboard';

import { SummaryCards } from './summary-cards';
import { StudentsByYearCourseChart } from './students-by-year-course-chart';
import { StudentsByDegreeChart } from './students-by-degree-chart';
import { GraduationByYearChart } from './graduation-by-year-chart';
import { PageHeader } from '@/components/page-header';

const DashboardPage = () => {
  const t = useTranslations('dashboard');
  const { fetchStudents, studentUsers, loader: userLoader } = useUser();
  const {
    fetchAllCourses,
    allCourseId,
    courseMap,
    loader: courseLoader,
  } = useCourse();
  const { stats, loader: dashboardLoader, fetchStats } = useDashboard();

  useSWR(
    'fetch-dashboard-data',
    async () => {
      await fetchStudents();
      await fetchAllCourses();
      await fetchStats();
    },
    {
      revalidateOnFocus: false,
    },
  );

  // Calculate totals for summary cards
  const totalStudents = studentUsers.length;
  const totalTeachers = stats?.totalTeachers ?? 0;
  const totalCourses = allCourseId.length;

  const isLoading = userLoader || courseLoader || dashboardLoader;

  // Get all unique years from students
  const allYears = React.useMemo(() => {
    const yearSet = new Set<string>();
    studentUsers.forEach((s) => {
      if (s.year) yearSet.add(s.year);
    });
    return Array.from(yearSet).sort();
  }, [studentUsers]);

  return (
    <>
      <PageHeader breadcrumbs={[{ label: t('title'), isPage: true }]} />
      <div className="container mx-auto space-y-6 py-8">
        <div className="mb-4">
          <h1 className="mb-2 text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        {/* Summary Cards */}
        <SummaryCards
          totalStudents={totalStudents}
          totalTeachers={totalTeachers}
          totalCourses={totalCourses}
          isLoading={isLoading}
        />

        {/* Charts 2x2 Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <StudentsByYearCourseChart
              students={studentUsers}
              courseMap={courseMap}
            />
          </div>
          <StudentsByDegreeChart
            students={studentUsers}
            courseMap={courseMap}
            allCourseIds={allCourseId}
            allYears={allYears}
          />
          <GraduationByYearChart
            courseMap={courseMap}
            allCourseIds={allCourseId}
          />
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
