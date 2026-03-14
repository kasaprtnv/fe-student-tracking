'use client';

import React from 'react';
import useSWR from 'swr';
import { DataTable } from '@/components/data-table/data-table';
import { useUser } from '@/hooks/use-user';
import { useCourse } from '@/hooks/use-course';
import { useTitle } from '@/hooks/use-title';
import { createStudentColumns } from './create-student-column';
import { CreateUserFormDialog } from './create-user-form';
import { UpdateUserFormDialog } from './update-user-form';
import { SelectOption } from '@/types';
import { User } from '@/types/user';
import { toast } from 'sonner';
import { useLocale, useTranslations } from 'next-intl';
import { DeleteTextConfirmationDialog } from '@/components/confirmation-delete-dialog';
import { useDebounce } from '@/lib/use-debounce';
interface StudentTableProps {
  onImport?: () => void;
  importLabel?: string;
}

export const StudentTable = ({ onImport, importLabel }: StudentTableProps) => {
  const {
    paginatedStudentsFromMap,
    studentPagination,
    searchQuery,
    setSearch: setSearchQuery,
    setStudentPage,
    setStudentPageSize,
    fetchStudents,
    searchForStudents,
    deleteExistingUser,
    deleteExistingUsers,
    userMap,
    storeAction,
    loader,
    getStudentProgressCount,
    getUserById,
  } = useUser();
  const { allCourseId, getCourseById, courseMap } = useCourse();
  const { titleMap, fetchTitlesUsage } = useTitle();
  const tUser = useTranslations('user');
  const tColumn = useTranslations('column');
  const tDegree = useTranslations('degree');
  const tCommon = useTranslations('common');
  const tForm = useTranslations('user');
  const locale = useLocale();

  // Local pagination state for immediate useSWR key updates
  const [currentPage, setCurrentPage] = React.useState(studentPagination.page);
  const [currentPageSize, setCurrentPageSize] = React.useState(
    studentPagination.pageSize,
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
  const studentsFetcher = React.useCallback(
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
          return await searchForStudents(
            searchQuery,
            page,
            pageSize,
            sortBy,
            sortOrder,
          );
        } else {
          return await fetchStudents(page, pageSize, sortBy, sortOrder);
        }
      } catch (err) {
        toast.error(tForm('toast.fetch_error'));
        throw err;
      }
    },
    [fetchStudents, searchForStudents, tForm],
  );

  const { mutate } = useSWR(
    [
      'fetch-students',
      debouncedSearchQuery,
      currentPage,
      currentPageSize,
      currentSortBy,
      currentSortOrder,
    ],
    studentsFetcher,
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
    };
    window.addEventListener('user-imported', handleUserImported);
    return () => {
      window.removeEventListener('user-imported', handleUserImported);
    };
  }, [mutate]);

  // Enrich users with courseName
  const filterStudent = React.useMemo(
    () =>
      paginatedStudentsFromMap.map((user) => {
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
    [paginatedStudentsFromMap, getCourseById],
  );

  // Create course options for dropdown
  const courseOptions: SelectOption[] = allCourseId
    .map((id) => {
      const course = getCourseById(id);
      if (!course) return undefined;
      return { label: `${course.code} - ${course.name}`, value: course.id };
    })
    .filter((option): option is SelectOption => option !== undefined);

  const allCourses = allCourseId.map((id) => courseMap[id]).filter(Boolean);

  const studentColumns = createStudentColumns(
    tColumn,
    tDegree,
    tUser,
    titleMap,
    locale,
  );

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
    progressCount: number;
  }>({
    isDeleting: false,
    progressCount: 0,
  });

  const getDeleteDescription = () => {
    if (!isDelete.userIds || isDelete.userIds.length === 0) {
      return '';
    }

    if (isDelete.userIds.length === 1) {
      return tUser('dialog.confirm_delete_user_with_progress', {
        count: isDelete.userIds.length,
      });
    } else {
      return tUser('dialog.delete-users-with-progress-description', {
        count: isDelete.userIds.length,
        progressCount: isDelete.progressCount,
      });
    }
  };

  const getConfirmText = () => {
    if (!isDelete.userIds || isDelete.userIds.length === 0) {
      return '';
    }

    if (isDelete.userIds.length === 1) {
      const user =
        isDelete?.users?.[0] ||
        getUserById(isDelete.userIds[0]) ||
        filterStudent.find((u) => u.id === isDelete.userIds![0]);
      return user ? user.code || user.firstName : 'DELETE USER';
    } else {
      return 'DELETE SELECTED USERS';
    }
  };

  const getWarningText = () => {
    if (!isDelete.userIds || isDelete.userIds.length === 0) {
      return undefined;
    }

    if (isDelete.userIds.length > 1) {
      return tUser('dialog.warning-delete-users-with-progress', {
        count: isDelete.userIds.length,
        progressCount: isDelete.progressCount,
      });
    }
  };

  const handleMultiDeleteClick = async (users: User[]) => {
    // In student table, everyone is a student, so we check all
    const studentIds = users.map((u) => u.id);

    if (studentIds.length > 0) {
      let totalProgressCount = 0;
      try {
        const counts = await Promise.all(
          studentIds.map((id) => getStudentProgressCount(id).catch(() => 0)),
        );
        totalProgressCount = counts.reduce((acc, curr) => acc + curr, 0);

        setIsDelete({
          isDeleting: true,
          userIds: users.map((u) => u.id),
          users,
          progressCount: totalProgressCount,
        });
      } catch (error) {
        console.error('Error checking progress count:', error);
      }
    }
  };

  const handleDeleteClick = async (userId: string) => {
    try {
      const count = await getStudentProgressCount(userId);
      const user =
        getUserById(userId) || filterStudent.find((u) => u.id === userId);
      setIsDelete({
        isDeleting: true,
        userIds: [userId],
        users: user ? [user] : undefined,
        progressCount: count,
      });
    } catch (error) {
      console.error('Error checking progress count:', error);
    }
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
      setIsDelete({ isDeleting: false, userIds: undefined, progressCount: 0 });
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
      setStudentPage(1);
    },
    [setSearchQuery, setStudentPage],
  );

  const handlePageChange = React.useCallback(
    (page: number) => {
      setCurrentPage(page);
      setStudentPage(page);
    },
    [setStudentPage],
  );

  const handlePageSizeChange = React.useCallback(
    (pageSize: number) => {
      setCurrentPageSize(pageSize);
      setCurrentPage(1);
      setStudentPageSize(pageSize);
    },
    [setStudentPageSize],
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
      setStudentPage(1);
    },
    [setStudentPage],
  );

  // Memoize refresh function
  const refreshData = React.useCallback(() => {
    mutate();
  }, [mutate]);

  return (
    <>
      <DataTable
        columns={studentColumns}
        data={filterStudent}
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
        rowCount={studentPagination.total}
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
        allCourses={allCourses}
        user={isEdit.user}
        courseOptions={courseOptions}
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
            });
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
        minWidth="min-w-[680px]"
      />
    </>
  );
};
