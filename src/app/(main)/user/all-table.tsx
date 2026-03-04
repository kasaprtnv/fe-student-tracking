'use client';

import React from 'react';
import useSWR from 'swr';
import { DataTable } from '@/components/data-table/data-table';
import { useUser } from '@/hooks/use-user';
import { useCourse } from '@/hooks/use-course';
import { useTitle } from '@/hooks/use-title';
import { useCourseStaff } from '@/hooks/use-course_staff';
import { ICourseStaff } from '@/types/course-staff';
import { createAllStudentColumns } from './create-all-column';
import { CreateUserFormDialog } from './create-user-form';
import { UpdateUserFormDialog } from './update-user-form';
import { DeleteTextConfirmationDialog } from '@/components/confirmation-delete-dialog';
import { SelectOption } from '@/types';
import { User } from '@/types/user';
import { toast } from 'sonner';
import { useDebounce } from '@/lib/use-debounce';
import { useTranslations } from 'next-intl';

interface AllTableProps {
  onImport?: () => void;
  importLabel?: string;
}

export const AllTable = ({ onImport, importLabel }: AllTableProps) => {
  const {
    paginatedUsersFromMap,
    pagination,
    searchQuery,
    setSearch: setSearchQuery,
    setPage,
    setPageSize,
    fetchAllUsers,
    searchForUsers,
    deleteExistingUser,
    deleteExistingUsers,
    getUserById,
    storeAction,
    loader,
    userMap,
    getStudentProgressCount,
  } = useUser();
  const { allCourseId, getCourseById, courseMap } = useCourse();
  const { titleMap, fetchTitlesUsage } = useTitle();
  const { fetchAllCourseStaff } = useCourseStaff();
  const [allCourseStaff, setAllCourseStaff] = React.useState<ICourseStaff[]>(
    [],
  );
  const tUser = useTranslations('user');
  const tColumn = useTranslations('column');
  const tRole = useTranslations('role');
  const tCommon = useTranslations('common');
  const tForm = useTranslations('user');

  // Fetch courses and titles on mount
  React.useEffect(() => {
    // fetchAllCourses();
    // fetchAllTitles();
    fetchAllCourseStaff().then((response) => {
      if (response.data) {
        setAllCourseStaff(response.data);
      }
    });
  }, [fetchAllCourseStaff]);

  const refetchCourseStaff = React.useCallback(() => {
    fetchAllCourseStaff().then((response) => {
      if (response.data) {
        setAllCourseStaff(response.data);
      }
    });
  }, [fetchAllCourseStaff]);

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

  // Stable reference to fetcher function
  const usersFetcher = React.useCallback(
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
          return await searchForUsers(
            searchQuery,
            page,
            pageSize,
            sortBy,
            sortOrder,
          );
        } else {
          return await fetchAllUsers(page, pageSize, sortBy, sortOrder);
        }
      } catch (err) {
        toast.error(tForm('toast.fetch_error'));
        throw err;
      }
    },
    [fetchAllUsers, searchForUsers, tForm],
  );

  const { mutate } = useSWR(
    [
      'fetch-all-users',
      debouncedSearchQuery,
      currentPage,
      currentPageSize,
      currentSortBy,
      currentSortOrder,
    ],
    usersFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 1000,
      keepPreviousData: true, // Keep previous data while fetching new
    },
  );

  // Listen for user import events to refetch table data
  React.useEffect(() => {
    const handleUserImported = () => {
      mutate();
      refetchCourseStaff();
    };
    window.addEventListener('user-imported', handleUserImported);
    return () => {
      window.removeEventListener('user-imported', handleUserImported);
    };
  }, [mutate, refetchCourseStaff]);

  // Enrich users with courseName
  const allUsers = React.useMemo(
    () =>
      paginatedUsersFromMap.map((user) => {
        if (user.courseId) {
          const course = getCourseById(user.courseId);
          if (course) {
            return {
              ...user,
              courseName: `${course.code} - ${course.name}`,
            };
          }
        }
        return user;
      }),
    [paginatedUsersFromMap, getCourseById],
  );

  // Create course options for dropdown
  const courseOptions: SelectOption[] = allCourseId
    .map((id) => {
      const course = getCourseById(id);
      if (!course) return undefined;
      return { label: `${course.code} - ${course.name}`, value: course.id };
    })
    .filter((option): option is SelectOption => option !== undefined);

  const allColumns = createAllStudentColumns(tColumn, tUser, tRole, titleMap);
  const allCourses = allCourseId.map((id) => courseMap[id]).filter(Boolean);

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
    progressCount: number;
    isStudentDelete: boolean;
  }>({
    isDeleting: false,
    progressCount: 0,
    isStudentDelete: false,
  });

  const getDeleteDescription = () => {
    if (!isDelete.userIds || isDelete.userIds.length === 0) {
      return '';
    }

    // For students with progress records
    if (isDelete.isStudentDelete) {
      if (isDelete.userIds.length === 1) {
        return tUser('dialog.confirm_delete_user_with_progress', {
          count: isDelete.progressCount,
        });
      } else {
        return tUser('dialog.delete-users-with-progress-description', {
          count: isDelete.userIds.length,
          progressCount: isDelete.progressCount,
        });
      }
    }

    // For teachers or students without progress
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
      const user = getUserById(isDelete.userIds[0]);
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
      if (isDelete.isStudentDelete && isDelete.progressCount > 0) {
        return tUser('dialog.warning-delete-users-with-progress', {
          count: isDelete.userIds.length,
          progressCount: isDelete.progressCount,
        });
      }
      return tUser('warning-delete-user', { count: isDelete.userIds.length });
    }
  };

  const handleMultiDeleteClick = async (users: User[]) => {
    // Check if any selected student has progress
    // Filter for student role first to avoid unnecessary requests
    const studentIds = users
      .filter((u) => u.role === 'student')
      .map((u) => u.id);

    const hasStudents = studentIds.length > 0;

    if (hasStudents) {
      let totalProgressCount = 0;
      try {
        // Use Promise.all for parallel checking
        const counts = await Promise.all(
          studentIds.map((id) => getStudentProgressCount(id).catch(() => 0)),
        );
        totalProgressCount = counts.reduce((acc, curr) => acc + curr, 0);

        // Show delete dialog with student progress info
        setIsDelete({
          isDeleting: true,
          userIds: users.map((u) => u.id),
          progressCount: totalProgressCount,
          isStudentDelete: true,
        });
        return;
      } catch (error) {
        console.error('Error checking progress count:', error);
      }
    }

    // Normal multi-delete flow (teachers only)
    setIsDelete({
      isDeleting: true,
      userIds: users.map((u) => u.id),
      progressCount: 0,
      isStudentDelete: false,
    });
  };

  const handleDeleteClick = async (userId: string) => {
    // Check if user is a student and has progress
    const user = userMap[userId];
    if (user?.role === 'student') {
      try {
        const count = await getStudentProgressCount(userId);
        // Show delete dialog with student progress info
        setIsDelete({
          isDeleting: true,
          userIds: [userId],
          progressCount: count,
          isStudentDelete: true,
        });
        return;
      } catch (error) {
        console.error('Error checking progress count:', error);
      }
    }

    // Normal delete flow (teacher)
    setIsDelete({
      isDeleting: true,
      userIds: [userId],
      progressCount: 0,
      isStudentDelete: false,
    });
  };

  const onConfirmDelete = async () => {
    if (!isDelete.userIds || isDelete.userIds.length === 0) return;

    try {
      if (isDelete.userIds.length === 1) {
        await deleteExistingUser(isDelete.userIds[0]);
        toast.success(tUser('toast.deleted-successfully'));
      } else {
        await deleteExistingUsers(isDelete.userIds);
        toast.success(tUser('toast.deleted-multiple-successfully'));
      }
      refreshData();
      // Refresh title usage status after user deletion
      fetchTitlesUsage();
      setIsDelete({
        isDeleting: false,
        userIds: undefined,
        progressCount: 0,
        isStudentDelete: false,
      });
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
      setPage(1);
    },
    [setSearchQuery, setPage],
  );

  const handlePageChange = React.useCallback(
    (page: number) => {
      setCurrentPage(page);
      setPage(page);
    },
    [setPage],
  );

  const handlePageSizeChange = React.useCallback(
    (pageSize: number) => {
      setCurrentPageSize(pageSize);
      setCurrentPage(1);
      setPageSize(pageSize);
    },
    [setPageSize],
  );

  const handleSortChange = React.useCallback(
    (sortBy: string | undefined, sortOrder: 'asc' | 'desc' | undefined) => {
      setCurrentSortBy(sortBy);
      setCurrentSortOrder(sortOrder);
      setCurrentPage(1);
      setPage(1);
    },
    [setPage],
  );

  // Memoize refresh function
  const refreshData = React.useCallback(() => {
    mutate();
  }, [mutate]);

  return (
    <>
      <DataTable
        columns={allColumns}
        data={allUsers}
        searchQuery={searchQuery}
        onSearch={onSearchChange}
        onAdd={() => setIsAdd(true)}
        onEdit={(user) => {
          setIsEdit({ isEditing: true, user: user });
        }}
        onDelete={(userId) => {
          handleDeleteClick(userId);
        }}
        onMultiDelete={(users) => {
          handleMultiDeleteClick(users);
        }}
        onImport={onImport}
        buttonImportLabel={importLabel}
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
      <CreateUserFormDialog
        open={isAdd}
        onOpenChange={setIsAdd}
        courseOptions={courseOptions}
        allCourses={allCourses}
        defaultRole="student"
        onUserCreated={refreshData}
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
            setIsDelete({
              isDeleting: false,
              userIds: undefined,
              progressCount: 0,
              isStudentDelete: false,
            });
          }
        }}
        onConfirm={onConfirmDelete}
        title={
          isDelete.userIds?.length === 1
            ? tUser('delete-user-title')
            : tUser('delete-users-title')
        }
        description={getDeleteDescription()}
        confirmText={getConfirmText()}
        isLoading={storeAction === 'deleting'}
        destructiveButtonText={tCommon('delete')}
        cancelButtonText={tCommon('cancel')}
        warningText={getWarningText()}
        minWidth={
          isDelete.isStudentDelete && (isDelete?.userIds?.length ?? 0) > 1
            ? 'min-w-[680px]'
            : undefined
        }
      />
    </>
  );
};
