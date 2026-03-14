import React from 'react';
import useSWR from 'swr';
import { useUser } from '@/hooks/use-user';
import { useCourse } from '@/hooks/use-course';
import { useTitle } from '@/hooks/use-title';
import { useCourseStaff } from '@/hooks/use-course_staff';
import { createTeacherColumns } from './create-teacher-column';
import { User } from '@/types/user';
import { ICourseStaff } from '@/types/course-staff';
import { DataTable } from '../../../components/data-table/data-table';
import { CreateUserFormDialog } from './create-user-form';
import { UpdateUserFormDialog } from './update-user-form';
import { SelectOption } from '@/types';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { DeleteTextConfirmationDialog } from '@/components/confirmation-delete-dialog';
import { useDebounce } from '@/lib/use-debounce';

interface TeacherTableProps {
  onImport?: () => void;
  importLabel?: string;
}

export const TeacherTable = ({ onImport, importLabel }: TeacherTableProps) => {
  const {
    paginatedTeachersFromMap,
    teacherPagination,
    searchQuery,
    setSearch: setSearchQuery,
    setTeacherPage,
    setTeacherPageSize,
    fetchTeachers,
    searchForTeachers,
    deleteExistingUser,
    deleteExistingUsers,
    getUserById,
    storeAction,
    loader,
  } = useUser();
  const { allCourseId, getCourseById, courseMap } = useCourse();
  const { titleMap, fetchAllTitles, fetchTitlesUsage } = useTitle();
  const { fetchAllCourseStaff } = useCourseStaff();
  const [allCourseStaff, setAllCourseStaff] = React.useState<ICourseStaff[]>(
    [],
  );
  const tUser = useTranslations('user');
  const tColumn = useTranslations('column');
  const tCommon = useTranslations('common');
  const tForm = useTranslations('user');

  // Fetch courses, titles and course_staff on mount
  React.useEffect(() => {
    fetchAllCourseStaff().then((response) => {
      if (response.data) {
        setAllCourseStaff(response.data);
      }
    });
  }, [fetchAllCourseStaff, fetchAllTitles]);

  // Refetch course_staff data (called after form save or import)
  const refetchCourseStaff = React.useCallback(() => {
    fetchAllCourseStaff().then((response) => {
      if (response.data) {
        setAllCourseStaff(response.data);
      }
    });
  }, [fetchAllCourseStaff]);

  // Local pagination state for immediate useSWR key updates
  const [currentPage, setCurrentPage] = React.useState(teacherPagination.page);
  const [currentPageSize, setCurrentPageSize] = React.useState(
    teacherPagination.pageSize,
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

  // Stable reference to fetcher function
  const teachersFetcher = React.useCallback(
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
          return await searchForTeachers(
            searchQuery,
            page,
            pageSize,
            sortBy,
            sortOrder,
          );
        } else {
          return await fetchTeachers(page, pageSize, sortBy, sortOrder);
        }
      } catch (err) {
        toast.error(tForm('toast.fetch_error'));
        throw err;
      }
    },
    [fetchTeachers, searchForTeachers, tForm],
  );

  const { mutate } = useSWR(
    [
      'fetch-teachers',
      debouncedSearchQuery,
      currentPage,
      currentPageSize,
      currentSortBy,
      currentSortOrder,
    ],
    teachersFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 1000,
      keepPreviousData: true, // Keep previous data while fetching new
    },
  );

  // Listen for user import events to refetch course_staff and table data
  React.useEffect(() => {
    const handleUserImported = () => {
      refetchCourseStaff();
      mutate();
    };

    window.addEventListener('user-imported', handleUserImported);
    return () => {
      window.removeEventListener('user-imported', handleUserImported);
    };
  }, [refetchCourseStaff, mutate]);

  // Enrich teachers with managedCourses
  const filterTeacher = React.useMemo(
    () =>
      paginatedTeachersFromMap.map((user) => {
        // Find all course_staff for this teacher
        const teacherCourseStaff = allCourseStaff.filter(
          (cs) => cs.userId === user.id,
        );
        // Get course names for each managed course
        const managedCourses = teacherCourseStaff
          .map((cs) => {
            const course = getCourseById(cs.courseId);
            return course
              ? { id: course.id, name: `${course.code} - ${course.name}` }
              : null;
          })
          .filter(
            (course): course is { id: string; name: string } => course !== null,
          );

        return {
          ...user,
          managedCourses: managedCourses,
        };
      }),
    [paginatedTeachersFromMap, getCourseById, allCourseStaff],
  );

  // Create course options for dropdown
  const courseOptions: SelectOption[] = allCourseId
    .map((id) => {
      const course = getCourseById(id);
      if (!course) return undefined;
      return { label: `${course.code} - ${course.name}`, value: course.id };
    })
    .filter((option): option is SelectOption => option !== undefined);

  const teacherColumns = createTeacherColumns(tColumn, tUser, titleMap);

  const getDeleteDescription = () => {
    if (!isDelete.userIds || isDelete.userIds.length === 0) {
      return '';
    }

    if (isDelete.userIds.length === 1) {
      return tUser('delete-user-description');
    } else {
      return tUser('delete-users-description', {
        count: isDelete.userIds.length,
      });
    }
  };
  const getConfirmText = () => {
    if (!isDelete.userIds || isDelete.userIds.length === 0) {
      return '';
    }

    if (isDelete.userIds.length === 1) {
      const user = isDelete.users?.[0] || getUserById(isDelete.userIds[0]);
      return user ? user.code || user.email || user.firstName : 'DELETE USER';
    } else {
      return 'DELETE SELECTED USERS';
    }
  };

  const getWarningText = () => {
    if (!isDelete.userIds || isDelete.userIds.length === 0) {
      return undefined;
    }

    if (isDelete.userIds.length > 1) {
      return tUser('warning-delete-user', { count: isDelete.userIds.length });
    }
  };
  const [isEdit, setIsEdit] = React.useState<{
    isEditing: boolean;
    user?: User;
  }>({
    isEditing: false,
  });
  const [isAdd, setIsAdd] = React.useState(false);
  const [isDelete, setIsDelete] = React.useState<{
    isDeleting: boolean;
    userIds?: string[];
    users?: User[];
  }>({
    isDeleting: false,
  });

  const allCourses = allCourseId.map((id) => courseMap[id]).filter(Boolean);

  const onConfirmDelete = async () => {
    if (!isDelete.userIds || isDelete.userIds.length === 0) return;

    try {
      if (isDelete.userIds.length === 1) {
        // Single delete
        await deleteExistingUser(isDelete.userIds[0]);
        toast.success(tUser('toast.deleted-successfully'));
      } else {
        // Multiple delete
        await deleteExistingUsers(isDelete.userIds);
        toast.success(tUser('toast.deleted-multiple-successfully'));
      }
      refreshData();
      // Refresh title usage status after user deletion
      fetchTitlesUsage();
      setIsDelete({ isDeleting: false, userIds: undefined });
    } catch (error) {
      console.error('Failed to delete user(s):', error);
      // Parse error message and translate if it's a known error code
      let errorMessage = tUser('toast.delete-failed');
      if (typeof error === 'string') {
        try {
          const parsed = JSON.parse(error);
          if (parsed.code === 'MILESTONE_PROGRESS_EXISTS') {
            errorMessage = tUser('toast.milestone-progress-exists', {
              count: parsed.count,
            });
          }
        } catch {
          // Not JSON, use as-is or fallback
          errorMessage = error || tUser('toast.delete-failed');
        }
      }
      toast.error(errorMessage);
    }
  };

  // Memoize search handler
  const onSearchChange = React.useCallback(
    (value: string) => {
      setSearchQuery(value);
      setCurrentPage(1);
      setTeacherPage(1);
    },
    [setSearchQuery, setTeacherPage],
  );

  const handlePageChange = React.useCallback(
    (page: number) => {
      setCurrentPage(page);
      setTeacherPage(page);
    },
    [setTeacherPage],
  );

  const handlePageSizeChange = React.useCallback(
    (pageSize: number) => {
      setCurrentPageSize(pageSize);
      setCurrentPage(1);
      setTeacherPageSize(pageSize);
    },
    [setTeacherPageSize],
  );

  const handleSortChange = React.useCallback(
    (sortBy: string | undefined, sortOrder: 'asc' | 'desc' | undefined) => {
      // Flip sort order for boolean columns so "Active" appears first on asc
      const adjustedSortOrder =
        sortBy === 'isActive' && sortOrder
          ? sortOrder === 'asc'
            ? 'desc'
            : 'asc'
          : sortOrder;

      setCurrentSortBy(sortBy);
      setCurrentSortOrder(adjustedSortOrder);
      setCurrentPage(1);
      setTeacherPage(1);
    },
    [setTeacherPage],
  );

  // Memoize refresh function
  const refreshData = React.useCallback(() => {
    mutate();
  }, [mutate]);

  return (
    <>
      <DataTable
        columns={teacherColumns}
        data={filterTeacher}
        searchQuery={searchQuery}
        onSearch={onSearchChange}
        onAdd={() => setIsAdd(true)}
        onEdit={(user) => {
          setIsEdit({ isEditing: true, user: user });
        }}
        onDelete={(userId) => {
          const user =
            getUserById(userId) || filterTeacher.find((u) => u.id === userId);
          setIsDelete({
            isDeleting: true,
            userIds: [userId],
            users: user ? [user] : undefined,
          });
        }}
        onMultiDelete={(users) => {
          setIsDelete({
            isDeleting: true,
            userIds: users.map((u) => u.id),
            users,
          });
        }}
        onImport={onImport}
        buttonImportLabel={importLabel}
        isLoading={loader || storeAction !== 'none'}
        manualPagination={true}
        manualSorting={true}
        onSortChange={handleSortChange}
        page={currentPage}
        pageSize={currentPageSize}
        rowCount={teacherPagination.total}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
      <CreateUserFormDialog
        open={isAdd}
        onOpenChange={setIsAdd}
        courseOptions={courseOptions}
        defaultRole="teacher"
        allCourses={allCourses}
        onUserCreated={() => {
          refreshData();
          refetchCourseStaff();
        }}
      />
      <UpdateUserFormDialog
        open={isEdit.isEditing}
        onOpenChange={(open) =>
          setIsEdit({ isEditing: open, user: isEdit.user })
        }
        user={isEdit.user}
        courseOptions={courseOptions}
        allCourses={allCourses}
        allCourseStaff={allCourseStaff}
        onCourseStaffChange={refetchCourseStaff}
        onUserUpdated={() => fetchTitlesUsage()}
      />
      <DeleteTextConfirmationDialog
        open={isDelete.isDeleting}
        onOpenChange={(open) => {
          if (!open) {
            setIsDelete({ isDeleting: false, userIds: undefined });
          }
        }}
        onConfirm={onConfirmDelete}
        title={tUser('delete-user-title')}
        description={getDeleteDescription()}
        confirmText={getConfirmText()}
        isLoading={storeAction === 'deleting'}
        destructiveButtonText={tCommon('delete')}
        cancelButtonText={tCommon('cancel')}
        warningText={getWarningText()}
      />
    </>
  );
};
