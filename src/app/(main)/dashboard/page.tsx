'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { useTranslations } from 'next-intl';
import { useUser } from '@/hooks/use-user';
import { useCourse } from '@/hooks/use-course';
import { useDashboard } from '@/hooks/use-dashboard';
import { useAuth } from '@/hooks/use-auth';
import { useCourseStaff } from '@/hooks/use-course_staff';

import { SummaryCards } from './summary-cards';
import { StudentsByYearCourseChart } from './students-by-year-course-chart';
import { StudentsByDegreeChart } from './students-by-degree-chart';
import { GraduationByYearChart } from './graduation-by-year-chart';
import { PageHeader } from '@/components/page-header';

const DashboardPage = () => {
  const t = useTranslations('dashboard');
  const router = useRouter();
  const { user, initialized } = useAuth();

  useEffect(() => {
    if (!initialized) return;
    if (user && user.role !== 'admin' && user.role !== 'teacher') {
      router.replace(`/profile/${user.id}`);
    }
  }, [user, initialized, router]);

  const {
    fetchStudents,
    studentUsers,
    allStudentUsers,
    loader: userLoader,
  } = useUser();
  const {
    fetchAllCourses,
    allCourseId,
    courseMap,
    loader: courseLoader,
  } = useCourse();
  const { stats, loader: dashboardLoader, fetchStats } = useDashboard();
  const { fetchCourseStaffByUser } = useCourseStaff();

  // State for teacher's managed course IDs
  const [teacherCourseIds, setTeacherCourseIds] = useState<string[]>([]);
  const [teacherCoursesLoaded, setTeacherCoursesLoaded] = useState(false);

  // Fetch teacher's managed courses when user is loaded
  useEffect(() => {
    const fetchTeacherCourses = async () => {
      if (!user || !initialized) return;

      if (user.role === 'teacher' && user.id) {
        try {
          const response = await fetchCourseStaffByUser(user.id);
          const courseIds = response.data.map(
            (cs: { courseId: string }) => cs.courseId,
          );
          setTeacherCourseIds(courseIds);
        } catch (error) {
          console.error('Failed to fetch teacher courses:', error);
          setTeacherCourseIds([]);
        }
      }
      setTeacherCoursesLoaded(true);
    };

    fetchTeacherCourses();
  }, [user, initialized, fetchCourseStaffByUser]);

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

  // Filter course IDs based on role
  const filteredCourseIds = React.useMemo(() => {
    if (user?.role === 'admin') return allCourseId;
    return allCourseId.filter((id) => teacherCourseIds.includes(id));
  }, [user, allCourseId, teacherCourseIds]);

  // Filter course map based on role
  const filteredCourseMap = React.useMemo(() => {
    if (user?.role === 'admin') return courseMap;
    return Object.fromEntries(
      Object.entries(courseMap).filter(([id]) => teacherCourseIds.includes(id)),
    );
  }, [user, courseMap, teacherCourseIds]);

  // Filter students based on role (active only, for summary card)
  const filteredStudents = React.useMemo(() => {
    if (user?.role === 'admin') return studentUsers;
    return studentUsers.filter(
      (s) => s.courseId && teacherCourseIds.includes(s.courseId),
    );
  }, [user, studentUsers, teacherCourseIds]);

  // Filter all students based on role (including inactive, for charts)
  const allFilteredStudents = React.useMemo(() => {
    if (user?.role === 'admin') return allStudentUsers;
    return allStudentUsers.filter(
      (s) => s.courseId && teacherCourseIds.includes(s.courseId),
    );
  }, [user, allStudentUsers, teacherCourseIds]);

  // Calculate totals for summary cards (using active students only)
  const totalStudents = filteredStudents.length;
  const totalTeachers = stats?.totalTeachers ?? 0;
  const totalCourses = filteredCourseIds.length;

  const isLoading =
    userLoader || courseLoader || dashboardLoader || !teacherCoursesLoaded;

  // Get all unique years from all students (including inactive)
  const allYears = React.useMemo(() => {
    const yearSet = new Set<string>();
    allFilteredStudents.forEach((s) => {
      if (s.year) yearSet.add(s.year);
    });
    return Array.from(yearSet).sort();
  }, [allFilteredStudents]);

  // Don't render anything until we confirm user is admin or teacher
  if (
    !initialized ||
    !user ||
    (user.role !== 'admin' && user.role !== 'teacher')
  ) {
    return null;
  }

  return (
    <>
      <PageHeader breadcrumbs={[{ label: t('title'), isPage: true }]} />
      <div className="container mx-auto space-y-6 overflow-x-hidden pt-2 pb-8">
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
          userRole={user.role}
        />

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <StudentsByYearCourseChart
              students={filteredStudents}
              courseMap={filteredCourseMap}
            />
          </div>
          <StudentsByDegreeChart
            students={filteredStudents}
            courseMap={filteredCourseMap}
            allCourseIds={filteredCourseIds}
            allYears={allYears}
          />
          <GraduationByYearChart
            students={allFilteredStudents}
            courseMap={filteredCourseMap}
            allCourseIds={filteredCourseIds}
            allYears={allYears}
          />
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
