'use client';

import { useCourse } from '@/hooks/use-course';
import { useLocale, useTranslations } from 'next-intl';
import { createCourseColumns } from './course-column';
import React from 'react';
import useSWR from 'swr';
import { toast } from 'sonner';
import { DataTable } from '@/components/data-table/data-table';
import { ICourse } from '@/types/course';
import { CreateCourseFormDialog } from './create-course-form';
import { UpdateCourseFormDialog } from './update-course-form';
import DeleteConfirmationDialog from '@/components/delete-dialog';
// import { useCourseStaff } from '@/hooks/use-course_staff';
import { useDebounce } from '@/lib/use-debounce';
import { useRouter } from 'next/navigation';
import { PageHeader } from '../../../components/page-header';
import { useUser } from '@/hooks/use-user';
import { SelectOption } from '@/types';

const CoursePage = () => {
  const tForm = useTranslations('course.course-form');
  const tCol = useTranslations('column');
  const tCourse = useTranslations('course');
  const tDegree = useTranslations('degree');
  const router = useRouter();
  const {
    allCoursesFromMap,
    pagination,
    searchQuery,
    fetchAllCourses,
    searchForCourses,
    setSearch: setSearchQuery,
    setPage,
    setPageSize,
    removeCourse,
    removeMultipleCourses,
    loader,
    storeAction,
  } = useCourse();
  // const { fetchAllCourseStaff } = useCourseStaff();
  const { fetchTeachers, allUserIds, getUserById } = useUser();
  const locale = useLocale();

  // Memoize columns to prevent unnecessary re-renders
  const courseColumns = React.useMemo(
    () =>
      createCourseColumns(tDegree, locale).map((column) => {
        if (typeof column.header === 'string') {
          return {
            ...column,
            header: tCol(column.header),
          };
        }
        return column;
      }),
    [tDegree, tCol, locale],
  );

  const [isEdit, setIsEdit] = React.useState<{
    isEditing: boolean;
    course?: ICourse;
  }>({
    isEditing: false,
  });
  const [isAdd, setIsAdd] = React.useState(false);
  const [isDelete, setIsDelete] = React.useState<{
    isDeleting: boolean;
    courseId?: string[];
  }>({
    isDeleting: false,
  });

  // Local pagination state for immediate useSWR key updates
  const [currentPage, setCurrentPage] = React.useState(pagination.page);
  const [currentPageSize, setCurrentPageSize] = React.useState(
    pagination.pageSize,
  );

  // Local sorting state for server-side sorting
  const [currentSortBy, setCurrentSortBy] = React.useState<string | undefined>(
    undefined,
  );
  const [currentSortOrder, setCurrentSortOrder] = React.useState<
    'asc' | 'desc' | undefined
  >(undefined);

  // Debounce search to avoid fetching on every keystroke
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useSWR(
    'fetch-course-staff-and-teachers',
    async () => {
      // await fetchAllCourseStaff();
      await fetchTeachers();
    },
    {
      revalidateOnFocus: false,
    },
  );

  // Stable reference to fetcher function to prevent unnecessary re-renders
  const coursesFetcher = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async ([_key, searchQuery, page, pageSize, sortBy, sortOrder]: [
      string,
      string,
      number,
      number,
      string | undefined,
      'asc' | 'desc' | undefined,
    ]) => {
      try {
        if (searchQuery && searchQuery.trim() !== '') {
          return await searchForCourses(
            searchQuery,
            page,
            pageSize,
            sortBy,
            sortOrder,
          );
        } else {
          return await fetchAllCourses(page, pageSize, sortBy, sortOrder);
        }
      } catch (err) {
        toast.error(tForm('toast.fetch_error'));
        throw err;
      }
    },
    [fetchAllCourses, searchForCourses, tForm],
  );

  const { mutate } = useSWR(
    [
      'courses',
      debouncedSearchQuery,
      currentPage,
      currentPageSize,
      currentSortBy,
      currentSortOrder,
    ],
    coursesFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 1000,
      keepPreviousData: true, // Keep previous data while fetching new
    },
  );

  // Memoize filtered course data to prevent unnecessary re-renders
  const filterCourseData = React.useMemo(
    () =>
      (allCoursesFromMap as ICourse[]).map((course) => {
        if (course.staffIds && course.staffIds.length > 0) {
          const users = course.staffIds
            .map((userId) => getUserById(userId))
            .filter((user) => user !== undefined);
          return { ...course, users };
        }
        return course;
      }),
    [allCoursesFromMap, getUserById],
  );

  // Memoize teacher options to prevent unnecessary re-renders
  const teacherOptions: SelectOption[] = React.useMemo(
    () =>
      allUserIds
        .map((id) => {
          const user = getUserById(id);
          if (!user || user.role !== 'teacher') return undefined;
          if (user.titleName === null) user.titleName = '';
          return {
            label: `${user.titleName}${user.firstName} ${user.lastName}`,
            value: user.id,
          };
        })
        .filter((option) => option !== undefined),
    [allUserIds, getUserById],
  );

  const onDeleteCourse = (id: string) => {
    setIsDelete({ isDeleting: true, courseId: [id] });
  };

  const onDeleteMultipleCourses = (courses: ICourse[]) => {
    setIsDelete({
      isDeleting: true,
      courseId: courses.map((course) => course.id),
    });
  };

  const onConfirmDelete = async () => {
    if (!isDelete.courseId || isDelete?.courseId.length == 0) return;

    try {
      if (isDelete.courseId.length === 1) {
        await removeCourse(isDelete.courseId[0]);
      } else {
        await removeMultipleCourses(isDelete.courseId);
      }

      refreshData();
      toast.success(tForm('toast.deleted-successfully'));
    } catch (error) {
      console.error('Error deleting courses:', error);
      toast.error(tForm('toast.deletion-failed'));
    } finally {
      setIsDelete({ isDeleting: false, courseId: undefined });
    }
  };

  // Memoize search handler
  const onSearchChange = React.useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Update local state immediately
    setPage(1); // Sync to Redux
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = React.useCallback(
    (page: number) => {
      setCurrentPage(page); // Update local state immediately
      setPage(page); // Sync to Redux
    },
    [setPage],
  );

  const handlePageSizeChange = React.useCallback(
    (pageSize: number) => {
      setCurrentPageSize(pageSize); // Update local state immediately
      setPageSize(pageSize); // Sync to Redux
    },
    [setPageSize],
  );

  const handleSortChange = React.useCallback(
    (sortBy: string | undefined, sortOrder: 'asc' | 'desc' | undefined) => {
      setCurrentSortBy(sortBy);
      setCurrentSortOrder(sortOrder);
      setCurrentPage(1); // Reset to first page on sort change
      setPage(1);
    },
    [setPage],
  );

  // Memoize refresh function
  const refreshData = React.useCallback(() => {
    mutate();
  }, [mutate]);

  // Memoize navigation function
  const toSelectMilestonePage = React.useCallback(
    (milestoneId: string) => {
      router.push(`/selected-milestone/${milestoneId}`);
    },
    [router],
  );

  return (
    <>
      <PageHeader breadcrumbs={[{ label: tCourse('title'), isPage: true }]} />
      <div className="container mx-auto pt-2 pb-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">{tCourse('title')}</h1>
          <p className="text-muted-foreground">{tCourse('sub_title')}</p>
        </div>
        <DataTable
          columns={courseColumns}
          data={filterCourseData ?? []}
          onAdd={() => setIsAdd(true)}
          onEdit={(course) => setIsEdit({ isEditing: true, course: course })}
          onDelete={onDeleteCourse}
          onLink={(m) => toSelectMilestonePage(m)}
          onMultiDelete={onDeleteMultipleCourses}
          // filterColumns={filterColumns}
          onSearch={onSearchChange}
          searchQuery={searchQuery}
          isLoading={loader || storeAction !== 'none'}
          manualPagination={true}
          manualSorting={true}
          onSortChange={handleSortChange}
          page={currentPage}
          pageSize={currentPageSize}
          rowCount={pagination.total}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
        <CreateCourseFormDialog
          open={isAdd}
          onOpenChange={() => {
            setIsAdd(false);
          }}
          teacherOptions={teacherOptions}
          onSuccess={refreshData}
        />
        <UpdateCourseFormDialog
          open={isEdit.isEditing && isEdit.course !== undefined}
          course={isEdit.course}
          onOpenChange={() => {
            setIsEdit({ isEditing: false, course: undefined });
          }}
          teacherOptions={teacherOptions}
          onSuccess={refreshData}
        />
        <DeleteConfirmationDialog
          open={isDelete.isDeleting}
          onClose={() =>
            setIsDelete({ isDeleting: false, courseId: undefined })
          }
          onConfirm={onConfirmDelete}
          isLoading={storeAction === 'deleting'}
          title="header"
          description="confirm"
          translationKey="course.delete"
          count={isDelete.courseId?.length}
        />
      </div>
    </>
  );
};

export default CoursePage;
