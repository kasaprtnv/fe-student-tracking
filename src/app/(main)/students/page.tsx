'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { Download } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import useSWR from 'swr';
import { DataTableClickable } from '@/components/data-table/data-table-clickable';
import { useUser } from '@/hooks/use-user';
import { useCourse } from '@/hooks/use-course';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { DataTableFilterField } from '@/components/data-table/types';
import { User, StudentFilterPayload } from '@/types/user';
import { createStudentColumns } from './student-column';
import { formatShortDate } from '@/lib/format-date';
import { PageHeader } from '@/components/page-header';
import { useDebounce } from '@/lib/use-debounce';
import {
  AdvancedFilterPopover,
  AdvancedFilterValues,
  defaultFilterValues,
} from './advanced-filter-dialog';
import { useTitle } from '@/hooks/use-title';

export default function StudentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('student-page');
  const tColumn = useTranslations('column');
  const tDegree = useTranslations('degree');
  const locale = useLocale();

  const { user } = useAuth();
  const { titleMap } = useTitle();
  const { allCourseId, courseMap, fetchCoursesByTeacherId } = useCourse();
  const {
    fetchFilteredStudents,
    filteredStudentsFromMap,
    filteredStudentPagination,
    filteredStudentLoader,
    error,
    clearErr,
  } = useUser();

  // Build initial filters from URL search params (from dashboard navigation)
  const initialFilters = useMemo((): AdvancedFilterValues => {
    const year = searchParams.get('year');
    const courseId = searchParams.get('courseId');
    const degree = searchParams.get('degree');
    const graduated = searchParams.get('graduated');

    if (!year && !courseId && !degree && !graduated) {
      return defaultFilterValues;
    }

    return {
      ...defaultFilterValues,
      year: year ? year.split(',') : [],
      courseId: courseId ? courseId.split(',') : [],
      degree: degree ? degree.split(',') : [],
      graduated: graduated ? graduated.split(',') : [],
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only compute once on mount

  // Local state for pagination, sorting, search, and filters
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(10);
  const [currentSortBy, setCurrentSortBy] = useState<string | undefined>(
    undefined,
  );
  const [currentSortOrder, setCurrentSortOrder] = useState<
    'asc' | 'desc' | undefined
  >(undefined);
  const [searchQuery, setSearch] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [advancedFilters, setAdvancedFilters] =
    useState<AdvancedFilterValues>(initialFilters);

  // Clear URL search params after applying initial filters
  useEffect(() => {
    if (searchParams.toString()) {
      router.replace('/students', { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useSWR(
    'fetch-course-data',
    async () => {
      if (!user) return;
      if (user.role === 'student') return; // students don't need course data
      await fetchCoursesByTeacherId(user.id);
    },
    { revalidateOnFocus: false },
  );

  // State: teacher's managed course IDs (for teacher only)
  const [teacherManagedCourseIds, setTeacherManagedCourseIds] = useState<
    string[]
  >([]);
  const [coursesLoaded, setCoursesLoaded] = useState(false);

  useEffect(() => {
    if (!user || user.role === 'student') {
      return;
    }
    fetchCoursesByTeacherId(user.id).then((courses) => {
      setTeacherManagedCourseIds(
        Array.isArray(courses?.data)
          ? courses.data.map((c: { id: string }) => c.id)
          : [],
      );
      setCoursesLoaded(true);
    });
  }, [user, fetchCoursesByTeacherId]);

  const allCourses = useMemo(() => {
    return allCourseId.map((id) => courseMap[id]).filter(Boolean);
  }, [allCourseId, courseMap]);

  // Create courses list for filter options
  const courseOptionsForFilter = useMemo(() => {
    if (!allCourses) return [];
    return allCourses.map((c) => ({
      label: `${c.code} - ${c.name}`,
      value: c.id,
    }));
  }, [allCourses]);

  // Build filter payload for API — only include non-empty values
  const filterPayload = useMemo((): StudentFilterPayload => {
    const { enrollDateFrom, enrollDateTo, ...rest } = advancedFilters;

    // Pick non-empty string/array fields from advancedFilters
    const entries = Object.entries(rest);

    const filtered = entries.filter(([, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return !!value;
    });

    const payload = Object.fromEntries(filtered);

    // Date fields need .toISOString() conversion
    if (enrollDateFrom) payload.enrollDateFrom = enrollDateFrom.toISOString();
    if (enrollDateTo) payload.enrollDateTo = enrollDateTo.toISOString();

    if (debouncedSearch) payload.search = debouncedSearch;

    // For teacher role, send managed course IDs to backend for filtering
    if (user?.role === 'teacher' && teacherManagedCourseIds.length > 0) {
      payload.managedCourseIds = teacherManagedCourseIds;
    }
    return payload;
  }, [advancedFilters, debouncedSearch, user?.role, teacherManagedCourseIds]);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setCurrentPage(1);
  }, []);

  // Determine if course data has been loaded (needed for teacher role)
  const isCourseStaffReady = useMemo(() => {
    if (!user) return false;
    if (user.role !== 'teacher') return true;
    // For teachers, wait until fetchCoursesByTeacherId has resolved
    return coursesLoaded;
  }, [user, coursesLoaded]);

  // For teacher with no managed courses, show empty table
  const teacherHasNoCourses = useMemo(() => {
    if (!user || user.role !== 'teacher') return false;
    if (!coursesLoaded) return false; // still loading
    return teacherManagedCourseIds.length === 0;
  }, [user, coursesLoaded, teacherManagedCourseIds]);

  // SWR key — null to defer fetching until ready
  const swrKey =
    user && isCourseStaffReady && !teacherHasNoCourses
      ? [
          'students-filter',
          currentPage,
          currentPageSize,
          currentSortBy,
          currentSortOrder,
          JSON.stringify(filterPayload),
        ]
      : null;

  useSWR(
    swrKey,
    () =>
      fetchFilteredStudents(
        filterPayload,
        currentPage,
        currentPageSize,
        currentSortBy,
        currentSortOrder,
      ),
    { revalidateOnFocus: false },
  );

  // Enrich students with course name
  const displayStudents = useMemo(() => {
    return filteredStudentsFromMap.map((user) => ({
      ...user,
      courseName: user.courseId
        ? courseMap[user.courseId]
          ? `${courseMap[user.courseId].code} - ${courseMap[user.courseId].name}`
          : '-'
        : '-',
    }));
  }, [filteredStudentsFromMap, courseMap]);

  // Year options — derived from loaded courses or a static list
  // Since we no longer load all students, derive from all courses or use a reasonable range
  const yearOptions = useMemo(() => {
    // Generate year options from a reasonable range
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 10;
    const years: string[] = [];
    for (let y = currentYear + 543; y >= startYear + 543; y--) {
      years.push(String(y));
    }
    return years.map((y) => ({ label: y, value: y }));
  }, []);

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
      { label: 'แผน ก', value: 'แผน ก' },
      { label: 'แผน ข', value: 'แผน ข' },
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
      advancedFilters.major !== '' ||
      advancedFilters.degree.length > 0 ||
      advancedFilters.year.length > 0 ||
      advancedFilters.courseId.length > 0 ||
      advancedFilters.studyPlan.length > 0 ||
      advancedFilters.enrollDateFrom !== undefined ||
      advancedFilters.enrollDateTo !== undefined ||
      advancedFilters.graduated.length > 0
    );
  }, [advancedFilters]);

  const handleViewProfile = useCallback(
    (id: string) => {
      router.push(`/profile/${id}`);
    },
    [router],
  );

  const studentColumns = useMemo(
    () =>
      createStudentColumns(
        tColumn,
        tDegree,
        titleMap,
        handleViewProfile,
        locale,
      ),
    [tColumn, tDegree, titleMap, handleViewProfile, locale],
  );

  const filterColumns = useMemo<DataTableFilterField<User>[]>(() => {
    return [];
  }, []);

  const handleExport = useCallback(async () => {
    // Fetch ALL filtered data without pagination for export
    try {
      const allData = await fetchFilteredStudents(
        filterPayload,
        1,
        999999, // large number to get all
        currentSortBy,
        currentSortOrder,
      );

      const getDegreeLabel = (degree: string | undefined) => {
        if (!degree) return '-';
        const degreeMap: Record<string, string> = {
          bachelor: tDegree('bachelor'),
          master: tDegree('master'),
          doctorate: tDegree('doctorate'),
        };
        return degreeMap[degree] || degree;
      };

      const exportData = (allData?.data || []).map((student: User) => ({
        [tColumn('student-code')]: student.code || '-',
        [tColumn('full-name')]:
          `${student.firstName || ''} ${student.lastName || ''}`.trim() || '-',
        [tColumn('email')]: student.email || '-',
        [tColumn('phone')]: student.phone || '-',
        [tColumn('education-level')]: getDegreeLabel(student.degree),
        [tColumn('year')]: student.year || '-',
        [tColumn('enrolled-course-name')]: student.courseId
          ? courseMap[student.courseId]
            ? `${courseMap[student.courseId].code} - ${courseMap[student.courseId].name}`
            : '-'
          : '-',
        [tColumn('study-plan')]: student.studyPlan || '-',
        [tColumn('enroll-date')]: student.enrollDate
          ? formatShortDate(student.enrollDate, locale)
          : '-',
        [tColumn('graduated')]: student.graduated
          ? tColumn('graduated-yes')
          : tColumn('graduated-no'),
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
      XLSX.writeFile(workbook, 'students_export.xlsx');
    } catch {
      console.error('Export failed');
    }
  }, [
    fetchFilteredStudents,
    filterPayload,
    currentSortBy,
    currentSortOrder,
    tColumn,
    tDegree,
    courseMap,
    locale,
  ]);

  const handleApplyFilter = (filters: AdvancedFilterValues) => {
    setAdvancedFilters(filters);
    setCurrentPage(1);
  };

  const handleSortChange = useCallback(
    (sortBy: string | undefined, sortOrder: 'asc' | 'desc' | undefined) => {
      setCurrentSortBy(sortBy);
      setCurrentSortOrder(sortOrder);
      setCurrentPage(1);
    },
    [],
  );

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    setCurrentPageSize(pageSize);
    setCurrentPage(1);
  }, []);

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
      <div className="container mx-auto pt-2 pb-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>

        <DataTableClickable
          data={displayStudents}
          columns={studentColumns}
          onSearch={handleSearch}
          searchQuery={searchQuery}
          enabledMultiSelect={false}
          filterColumns={filterColumns}
          manualPagination={true}
          page={currentPage}
          pageSize={currentPageSize}
          rowCount={filteredStudentPagination.total}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          manualSorting={true}
          onSortChange={handleSortChange}
          isLoading={filteredStudentLoader}
          extraToolbarAction={() => (
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
              <Button variant="outline" onClick={handleExport}>
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
