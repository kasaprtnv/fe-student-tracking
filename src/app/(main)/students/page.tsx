'use client';

import React, { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { Download, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { DataTableClickable } from '@/components/data-table/data-table-clickable';
import { useUser } from '@/hooks/use-user';
import { useCourse } from '@/hooks/use-course';
import { Button } from '@/components/ui/button';
import { DataTableFilterField } from '@/components/data-table/types';
import { User } from '@/types/user';
import { createStudentColumns } from './student-column';
import { formatDate } from '@/lib/format-date';
import { PageHeader } from '@/components/page-header';

export default function StudentPage() {
  const router = useRouter();
  const t = useTranslations('student-page');
  const tColumn = useTranslations('column');

  const { fetchAllCourses, allCourseId, courseMap } = useCourse();
  const {
    fetchStudents,
    studentUsers,
    loader: isLoading,
    error,
    clearErr,
  } = useUser();

  const [searchQuery, setSearch] = useState('');

  useEffect(() => {
    fetchStudents();
    fetchAllCourses();
  }, [fetchStudents, fetchAllCourses]);

  const allCourses = useMemo(() => {
    return allCourseId.map((id) => courseMap[id]).filter(Boolean);
  }, [allCourseId, courseMap]);

  // Create courses list for filter options, only unique names
  const courseOptions = useMemo(() => {
    if (!allCourses) return [];
    const uniqueCourseNames = Array.from(
      new Set(allCourses.map((c) => c.name)),
    );
    return uniqueCourseNames.map((name) => ({
      label: name,
      value: name,
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
      if (s.enrollDate) {
        try {
          const date = new Date(s.enrollDate);
          if (!isNaN(date.getTime())) {
            // Calculate academic year (Enroll Year + 543 for TH)
            const yearStr = (date.getFullYear() + 543).toString();
            years.add(yearStr);
          }
        } catch (error) {
          console.log(error);
          // ignore invalid date
        }
      }
    });
    return Array.from(years)
      .sort((a, b) => b.localeCompare(a))
      .map((y) => ({ label: y, value: y }));
  }, [enrichedStudents]);

  const displayStudents = useMemo(() => {
    if (!searchQuery) return enrichedStudents;
    const lowerQuery = searchQuery.toLowerCase();
    return enrichedStudents.filter(
      (student) =>
        student.firstName?.toLowerCase().includes(lowerQuery) ||
        student.lastName?.toLowerCase().includes(lowerQuery) ||
        student.code?.toLowerCase().includes(lowerQuery) ||
        student.email?.toLowerCase().includes(lowerQuery),
    );
  }, [enrichedStudents, searchQuery]);

  const studentColumns = useMemo(
    () => createStudentColumns(tColumn),
    [tColumn],
  );

  const filterColumns = useMemo<DataTableFilterField<User>[]>(() => {
    return [
      {
        id: 'courseName' as keyof User,
        label: tColumn('course'),
        value: 'courseName',
        options: courseOptions,
      },
      {
        id: 'academicYear' as keyof User,
        label: tColumn('academic-year'),
        value: 'academicYear',
        options: yearOptions,
      },
    ];
  }, [courseOptions, yearOptions, tColumn]);

  const handleViewProfile = (id: string) => {
    router.push(`/profile/${id}`);
  };

  const handleExport = (data: User[]) => {
    const exportData = data.map((student) => ({
      [tColumn('code')]: student.code || '',
      [tColumn('full-name')]: `${student.firstName} ${student.lastName}`,
      [tColumn('email')]: student.email || '',
      [tColumn('phone')]: student.phone || '',
      [tColumn('education-level')]: student.degree || '',
      [tColumn('course-name')]: student.courseName || '',
      [tColumn('academic-year')]: student.enrollDate
        ? (new Date(student.enrollDate).getFullYear() + 543).toString()
        : '',
      [tColumn('enroll-date')]: student.enrollDate
        ? formatDate(student.enrollDate)
        : '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    XLSX.writeFile(workbook, 'students_export.xlsx');
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
          onView={handleViewProfile}
          filterColumns={filterColumns}
          extraToolbarAction={(table) => (
            <Button
              variant="outline"
              onClick={() =>
                handleExport(
                  table.getFilteredRowModel().rows.map((row) => row.original),
                )
              }
              className="mr-2 ml-auto"
            >
              <Download className="mr-2 h-4 w-4" />
              {t('export-button')}
            </Button>
          )}
        />
      </div>
    </>
  );
}
