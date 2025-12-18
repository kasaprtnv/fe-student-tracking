'use client';

import * as React from 'react';
import useSWR from 'swr';
import { useUser } from '@/hooks/use-user';
import { useCourse } from '@/hooks/use-course';
import { dashboardService } from '@/services/dashboard.service';
import { IDashboardStats } from '@/types/dashboard';

import { SummaryCards } from './summary-cards';
import { StudentsByYearCourseChart } from './students-by-year-course-chart';
import { StudentsByDegreeChart } from './students-by-degree-chart';
import { MilestoneStatusChart } from './milestone-status-chart';
import { MilestoneByYearBarChart } from './milestone-by-year-bar-chart';

const DashboardPage = () => {
  const { fetchStudents, studentUsers, loader: userLoader } = useUser();
  const {
    fetchAllCourses,
    allCourseId,
    courseMap,
    loader: courseLoader,
  } = useCourse();

  const [dashboardStats, setDashboardStats] =
    React.useState<IDashboardStats | null>(null);
  const [statsLoader, setStatsLoader] = React.useState(false);
  useSWR(
    'fetch-dashboard-data',
    async () => {
      await fetchStudents();
      await fetchAllCourses();

      // Fetch dashboard stats
      setStatsLoader(true);
      try {
        const response = await dashboardService.getDashboardStats();
        if (response?.data) {
          setDashboardStats(response.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setStatsLoader(false);
      }
    },
    {
      revalidateOnFocus: false,
    },
  );

  // Calculate students by degree from real data
  const studentsByDegreeData = React.useMemo(() => {
    const masterCount = studentUsers.filter(
      (user) => user.degree === 'master',
    ).length;
    const doctorateCount = studentUsers.filter(
      (user) => user.degree === 'doctorate',
    ).length;
    return [
      { name: 'ปริญญาโท', value: masterCount, color: '#8b5cf6' },
      { name: 'ปริญญาเอก', value: doctorateCount, color: '#f59e0b' },
    ];
  }, [studentUsers]);

  // Calculate totals for summary cards
  const totalStudents = studentUsers.length;
  const totalTeachers = dashboardStats?.totalTeachers ?? 0;
  const totalCourses = allCourseId.length;
  const totalMilestones = dashboardStats?.totalMilestones ?? 0;

  const isLoading = userLoader || courseLoader || statsLoader;

  // Get all unique years from students
  const allYears = React.useMemo(() => {
    const yearSet = new Set<string>();
    studentUsers.forEach((s) => {
      if (s.year) yearSet.add(s.year);
    });
    return Array.from(yearSet).sort();
  }, [studentUsers]);

  return (
    <div className="container mx-auto space-y-6 py-8">
      {/* Summary Cards */}
      <SummaryCards
        totalStudents={totalStudents}
        totalTeachers={totalTeachers}
        totalCourses={totalCourses}
        totalMilestones={totalMilestones}
        isLoading={isLoading}
      />

      {/* Charts 2x2 Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <StudentsByYearCourseChart
          students={studentUsers}
          courseMap={courseMap}
        />
        <StudentsByDegreeChart data={studentsByDegreeData} />
        <MilestoneStatusChart
          courseMap={courseMap}
          allCourseIds={allCourseId}
          allYears={allYears}
        />
        <MilestoneByYearBarChart
          courseMap={courseMap}
          allCourseIds={allCourseId}
        />
      </div>
    </div>
  );
};

export default DashboardPage;
