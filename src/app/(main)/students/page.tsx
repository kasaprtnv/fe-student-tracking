'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { Download, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { DataTableClickable } from '@/components/data-table/data-table-clickable';
import { useUser } from '@/hooks/use-user';
import { useCourse } from '@/hooks/use-course';
import { useCourseStaff } from '@/hooks/use-course_staff';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { DataTableFilterField } from '@/components/data-table/types';
import { User } from '@/types/user';
import { createStudentColumns } from './student-column';
import { formatThaiDate } from '@/lib/format-date';
import { PageHeader } from '@/components/page-header';
import {
  AdvancedFilterPopover,
  AdvancedFilterValues,
  defaultFilterValues,
} from './advanced-filter-dialog';

export default function StudentPage() {
  const router = useRouter();
  const t = useTranslations('student-page');
  const tColumn = useTranslations('column');
  const tDegree = useTranslations('degree');

  const { user } = useAuth();
  const { fetchAllCourses, allCourseId, courseMap } = useCourse();
  const { allCourseStaffId, courseStaffMap, fetchAllCourseStaff } =
    useCourseStaff();
  const {
    fetchStudents,
    studentUsers,
    loader: isLoading,
    error,
    clearErr,
  } = useUser();

  const [searchQuery, setSearch] = useState('');
  const [advancedFilters, setAdvancedFilters] =
    useState<AdvancedFilterValues>(defaultFilterValues);

  useEffect(() => {
    fetchStudents();
    fetchAllCourses();
    fetchAllCourseStaff();
  }, [fetchStudents, fetchAllCourses, fetchAllCourseStaff]);

  // Get teacher's managed course IDs
  const teacherManagedCourseIds = useMemo(() => {
    if (!user || user.role !== 'teacher') return [];
    return allCourseStaffId
      .map((id) => courseStaffMap[id])
      .filter((cs) => (cs as unknown as { userId: string }).userId === user.id)
      .map((cs) => cs.courseId);
  }, [user, allCourseStaffId, courseStaffMap]);

  const allCourses = useMemo(() => {
    return allCourseId.map((id) => courseMap[id]).filter(Boolean);
  }, [allCourseId, courseMap]);

  // Create courses list for filter options
  const courseOptionsForFilter = useMemo(() => {
    if (!allCourses) return [];
    return allCourses.map((c) => ({
      label: c.name,
      value: c.id,
    }));
  }, [allCourses]);

  const enrichedStudents = useMemo(() => {
    if (!studentUsers) return [];
    return studentUsers.map((user) => ({
      ...user,
      courseName: user.courseId ? courseMap[user.courseId]?.name || '-' : '-',
    }));
  }, [studentUsers, courseMap]);

  const yearOptions = useMemo(() => {
    const years = new Set<string>();
    enrichedStudents.forEach((s) => {
      if (s.year) {
        years.add(s.year);
      }
    });
    return Array.from(years)
      .sort((a, b) => b.localeCompare(a))
      .map((y) => ({ label: y, value: y }));
  }, [enrichedStudents]);

  // Degree options for advanced filter
  const degreeOptions = useMemo(
    () => [
      { label: tDegree('master'), value: 'master' },
      { label: tDegree('doctorate'), value: 'doctorate' },
    ],
    [tDegree],
  );

  // Study plan options
  const studyPlanOptions = useMemo(
    () => [
      { label: 'ก', value: 'ก' },
      { label: 'ข', value: 'ข' },
    ],
    [],
  );

  // Graduated options
  const graduatedOptions = useMemo(
    () => [
      { label: tColumn('graduated-yes'), value: 'true' },
      { label: tColumn('graduated-no'), value: 'false' },
    ],
    [tColumn],
  );

  // Check if any advanced filter is active
  const isAdvancedFilterActive = useMemo(() => {
    return (
      advancedFilters.code !== '' ||
      advancedFilters.fullName !== '' ||
      advancedFilters.email !== '' ||
      advancedFilters.phone !== '' ||
      advancedFilters.degree.length > 0 ||
      advancedFilters.year.length > 0 ||
      advancedFilters.courseId.length > 0 ||
      advancedFilters.studyPlan.length > 0 ||
      advancedFilters.enrollDateFrom !== undefined ||
      advancedFilters.enrollDateTo !== undefined ||
      advancedFilters.graduated.length > 0
    );
  }, [advancedFilters]);

  const displayStudents = useMemo(() => {
    // Filter by teacher's managed courses first
    let filteredStudents = enrichedStudents;
    if (user?.role === 'teacher' && teacherManagedCourseIds.length > 0) {
      filteredStudents = enrichedStudents.filter((student) =>
        student.courseId
          ? teacherManagedCourseIds.includes(student.courseId)
          : false,
      );
    }

    // Apply advanced filters
    filteredStudents = filteredStudents.filter((student) => {
      // Code filter
      if (
        advancedFilters.code &&
        !student.code
          ?.toLowerCase()
          .includes(advancedFilters.code.toLowerCase())
      ) {
        return false;
      }

      // Full name filter
      if (advancedFilters.fullName) {
        const fullName =
          `${student.firstName || ''} ${student.lastName || ''}`.toLowerCase();
        if (!fullName.includes(advancedFilters.fullName.toLowerCase())) {
          return false;
        }
      }

      // Email filter
      if (
        advancedFilters.email &&
        !student.email
          ?.toLowerCase()
          .includes(advancedFilters.email.toLowerCase())
      ) {
        return false;
      }

      // Phone filter
      if (
        advancedFilters.phone &&
        !student.phone?.includes(advancedFilters.phone)
      ) {
        return false;
      }

      // Degree filter
      if (
        advancedFilters.degree.length > 0 &&
        !advancedFilters.degree.includes(student.degree || '')
      ) {
        return false;
      }

      // Year filter
      if (
        advancedFilters.year.length > 0 &&
        !advancedFilters.year.includes(student.year || '')
      ) {
        return false;
      }

      // Course filter
      if (
        advancedFilters.courseId.length > 0 &&
        !advancedFilters.courseId.includes(student.courseId || '')
      ) {
        return false;
      }

      // Study plan filter
      if (
        advancedFilters.studyPlan.length > 0 &&
        !advancedFilters.studyPlan.includes(student.studyPlan || '')
      ) {
        return false;
      }

      // Enroll date range filter
      if (advancedFilters.enrollDateFrom && student.enrollDate) {
        const enrollDate = new Date(student.enrollDate);
        const fromDate = new Date(advancedFilters.enrollDateFrom);
        fromDate.setHours(0, 0, 0, 0);
        if (enrollDate < fromDate) {
          return false;
        }
      }
      if (advancedFilters.enrollDateTo && student.enrollDate) {
        const enrollDate = new Date(student.enrollDate);
        const toDate = new Date(advancedFilters.enrollDateTo);
        toDate.setHours(23, 59, 59, 999);
        if (enrollDate > toDate) {
          return false;
        }
      }

      // Graduated filter
      if (advancedFilters.graduated.length > 0) {
        const graduatedValue = student.graduated ? 'true' : 'false';
        if (!advancedFilters.graduated.includes(graduatedValue)) {
          return false;
        }
      }

      return true;
    });

    // Then apply search filter
    if (!searchQuery) return filteredStudents;
    const lowerQuery = searchQuery.toLowerCase().trim();
    // Remove spaces for flexible matching
    const queryNoSpaces = lowerQuery.replace(/\s/g, '');

    return filteredStudents.filter((student) => {
      // Full name (with and without spaces)
      const fullName =
        `${student.firstName || ''} ${student.lastName || ''}`.toLowerCase();
      const fullNameNoSpaces = fullName.replace(/\s/g, '');

      // Degree mapping to Thai
      const degreeDisplay =
        student.degree === 'bachelor'
          ? 'ปริญญาตรี'
          : student.degree === 'master'
            ? 'ปริญญาโท'
            : student.degree === 'doctorate'
              ? 'ปริญญาเอก'
              : '';

      // Graduated mapping
      const graduatedDisplay = student.graduated ? 'สำเร็จ' : 'ยังไม่สำเร็จ';

      return (
        // Code
        student.code?.toLowerCase().includes(lowerQuery) ||
        // First name
        student.firstName?.toLowerCase().includes(lowerQuery) ||
        // Last name
        student.lastName?.toLowerCase().includes(lowerQuery) ||
        // Full name (with spaces)
        fullName.includes(lowerQuery) ||
        // Full name (without spaces for flexible matching)
        fullNameNoSpaces.includes(queryNoSpaces) ||
        // Email
        student.email?.toLowerCase().includes(lowerQuery) ||
        // Phone
        student.phone?.includes(lowerQuery) ||
        // Degree (English key)
        student.degree?.toLowerCase().includes(lowerQuery) ||
        // Degree (Thai display)
        degreeDisplay.includes(lowerQuery) ||
        // Year
        student.year?.toLowerCase().includes(lowerQuery) ||
        // Course name
        student.courseName?.toLowerCase().includes(lowerQuery) ||
        // Study plan
        student.studyPlan?.toLowerCase().includes(lowerQuery) ||
        // Graduated status
        graduatedDisplay.includes(lowerQuery)
      );
    });
  }, [
    enrichedStudents,
    searchQuery,
    user?.role,
    teacherManagedCourseIds,
    advancedFilters,
  ]);

  const handleViewProfile = useCallback(
    (id: string) => {
      router.push(`/profile/${id}`);
    },
    [router],
  );

  const studentColumns = useMemo(
    () => createStudentColumns(tColumn, tDegree, handleViewProfile),
    [tColumn, tDegree, handleViewProfile],
  );

  const filterColumns = useMemo<DataTableFilterField<User>[]>(() => {
    return [];
  }, []);

  const handleExport = (data: User[]) => {
    // Map degree to translated value
    const getDegreeLabel = (degree: string | undefined) => {
      if (!degree) return '-';
      const degreeMap: Record<string, string> = {
        bachelor: tDegree('bachelor'),
        master: tDegree('master'),
        doctorate: tDegree('doctorate'),
      };
      return degreeMap[degree] || degree;
    };

    const exportData = data.map((student) => ({
      [tColumn('student-code')]: student.code || '-',
      [tColumn('full-name')]:
        `${student.firstName || ''} ${student.lastName || ''}`.trim() || '-',
      [tColumn('email')]: student.email || '-',
      [tColumn('phone')]: student.phone || '-',
      [tColumn('education-level')]: getDegreeLabel(student.degree),
      [tColumn('year')]: student.year || '-',
      [tColumn('course-name')]: student.courseName || '-',
      [tColumn('study-plan')]: student.studyPlan || '-',
      [tColumn('enroll-date')]: student.enrollDate
        ? formatThaiDate(student.enrollDate)
        : '-',
      [tColumn('graduated')]: student.graduated
        ? tColumn('graduated-yes')
        : tColumn('graduated-no'),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    XLSX.writeFile(workbook, 'students_export.xlsx');
  };

  const handleApplyFilter = (filters: AdvancedFilterValues) => {
    setAdvancedFilters(filters);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center text-red-500">
          <p>Error loading data</p>
          <button
            onClick={clearErr}
            className="mt-4 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader breadcrumbs={[{ label: t('title'), isPage: true }]} />
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>

        <DataTableClickable
          data={displayStudents}
          columns={studentColumns}
          onSearch={setSearch}
          searchQuery={searchQuery}
          enabledMultiSelect={false}
          filterColumns={filterColumns}
          extraToolbarAction={(table) => (
            <div className="flex items-center gap-2">
              <AdvancedFilterPopover
                onApply={handleApplyFilter}
                currentFilters={advancedFilters}
                degreeOptions={degreeOptions}
                yearOptions={yearOptions}
                courseOptions={courseOptionsForFilter}
                studyPlanOptions={studyPlanOptions}
                graduatedOptions={graduatedOptions}
                isActive={isAdvancedFilterActive}
              />
              <Button
                variant="outline"
                onClick={() =>
                  handleExport(
                    table.getFilteredRowModel().rows.map((row) => row.original),
                  )
                }
              >
                <Download className="mr-2 h-4 w-4" />
                {t('export-button')}
              </Button>
            </div>
          )}
        />
      </div>
    </>
  );
}
