'use client';

import React from 'react';
import { DataTable } from '@/components/data-table/data-table';
import { useUser } from '@/hooks/use-user';
import { useCourse } from '@/hooks/use-course';
import { useTitle } from '@/hooks/use-title';
import { createAllStudentColumns } from './create-all-column';
import { CreateUserFormDialog } from './create-user-form';
import { UpdateUserFormDialog } from './update-user-form';
import { DeleteTextConfirmationDialog } from '@/components/confirmation-delete-dialog';
import { SelectOption } from '@/types';
import { User } from '@/types/user';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { formatThaiDate } from '@/lib/format-date';

interface AllTableProps {
  onImport?: () => void;
  importLabel?: string;
}

export const AllTable = ({ onImport, importLabel }: AllTableProps) => {
  const {
    searchQuery,
    setSearch: setSearchQuery,
    deleteExistingUser,
    deleteExistingUsers,
    getUserById,
    storeAction,
    userMap,
    getStudentProgressCount,
  } = useUser();
  const { allCourseId, getCourseById, fetchAllCourses } = useCourse();
  const { titleMap, fetchAllTitles } = useTitle();
  const t = useTranslations('user');
  const tColumn = useTranslations('column');
  const tDegree = useTranslations('degree');
  const tRole = useTranslations('role');
  const tCommon = useTranslations('common');

  // Fetch courses and titles on mount
  React.useEffect(() => {
    fetchAllCourses();
    fetchAllTitles();
  }, [fetchAllCourses, fetchAllTitles]);

  // Get all users data directly from Redux store userMap and enrich with courseName
  const allUsers = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return Object.values(userMap)
      .filter((user) => {
        if (!query) return true;
        // Create full name to allow searching like "นายสมชาย ใจดี"
        const titleName = user.titleId
          ? titleMap[user.titleId]?.name || ''
          : '';
        const fullName =
          `${titleName}${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
        // Strip non-digit characters for phone search
        const queryDigits = query.replace(/\D/g, '');
        const phoneDigits = user.phone?.replace(/\D/g, '') || '';
        // Strip spaces for flexible search
        const queryNoSpaces = query.replace(/\s/g, '');
        // Map role to Thai display text for search
        const roleDisplay =
          user.role === 'student'
            ? 'นักศึกษา'
            : user.role === 'teacher'
              ? 'อาจารย์'
              : user.role === 'admin'
                ? 'ผู้ดูแลระบบ'
                : '';
        // Map degree to Thai display text for search
        const degreeDisplay =
          user.degree === 'bachelor'
            ? 'ปริญญาตรี'
            : user.degree === 'master'
              ? 'ปริญญาโท'
              : user.degree === 'doctorate'
                ? 'ปริญญาเอก'
                : '';
        // Map degree to English display text for search
        const degreeDisplayEn =
          user.degree === 'bachelor'
            ? "bachelor's degree"
            : user.degree === 'master'
              ? "master's degree"
              : user.degree === 'doctorate'
                ? 'doctoral degree'
                : '';
        // Map role to English display text for search
        const roleDisplayEn =
          user.role === 'student'
            ? 'student'
            : user.role === 'teacher'
              ? 'staff members'
              : user.role === 'admin'
                ? 'admin'
                : '';
        return (
          titleName.toLowerCase().includes(query) ||
          user.firstName?.toLowerCase().includes(query) ||
          user.lastName?.toLowerCase().includes(query) ||
          user.code?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          user.year?.toLowerCase().includes(query) ||
          user.degree?.toLowerCase().includes(query) ||
          degreeDisplay.toLowerCase().includes(query) ||
          degreeDisplayEn.toLowerCase().includes(query) ||
          user.courseName?.toLowerCase().includes(query) ||
          (queryNoSpaces &&
            user.courseName
              ?.toLowerCase()
              .replace(/\s/g, '')
              .includes(queryNoSpaces)) ||
          user.role?.toLowerCase().includes(query) ||
          roleDisplay.toLowerCase().includes(query) ||
          roleDisplayEn.toLowerCase().includes(query) ||
          (user.enrollDate &&
            formatThaiDate(user.enrollDate).toLowerCase().includes(query)) ||
          (queryDigits && phoneDigits.includes(queryDigits)) ||
          fullName.includes(query) ||
          (queryNoSpaces && fullName.replace(/\s/g, '').includes(queryNoSpaces))
        );
      })
      .map((user) => {
        // Enrich user with courseName if courseId exists but courseName doesn't
        if (user.courseId && !user.courseName) {
          const course = getCourseById(user.courseId);
          if (course) {
            return {
              ...user,
              courseName: `${course.code} - ${course.name}`,
            };
          }
        }
        return user;
      });
  }, [userMap, searchQuery, getCourseById, titleMap]);

  // Create course options for dropdown
  const courseOptions: SelectOption[] = allCourseId
    .map((id) => {
      const course = getCourseById(id);
      if (!course) return undefined;
      return { label: `${course.code} - ${course.name}`, value: course.id };
    })
    .filter((option): option is SelectOption => option !== undefined);

  const allColumns = createAllStudentColumns(tColumn, tDegree, tRole, titleMap);

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
        return t('dialog.confirm_delete_user_with_progress', {
          count: isDelete.progressCount,
        });
      } else {
        return t('dialog.delete-users-with-progress-description', {
          count: isDelete.userIds.length,
          progressCount: isDelete.progressCount,
        });
      }
    }

    // For teachers or students without progress
    if (isDelete.userIds.length === 1) {
      return t('delete-user-description');
    } else {
      return t('delete-users-description', { count: isDelete.userIds.length });
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
        return t('dialog.warning-delete-users-with-progress', {
          count: isDelete.userIds.length,
          progressCount: isDelete.progressCount,
        });
      }
      return t('warning-delete-user', { count: isDelete.userIds.length });
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
        toast.success(t('toast.deleted-successfully'));
      } else {
        await deleteExistingUsers(isDelete.userIds);
        toast.success(t('toast.deleted-multiple-successfully'));
      }
      setIsDelete({
        isDeleting: false,
        userIds: undefined,
        progressCount: 0,
        isStudentDelete: false,
      });
    } catch (error) {
      console.error('Failed to delete user(s):', error);
      // Parse error message and translate if it's a known error code
      let errorMessage = t('toast.delete-failed');
      if (typeof error === 'string') {
        try {
          const parsed = JSON.parse(error);
          if (parsed.code === 'MILESTONE_PROGRESS_EXISTS') {
            errorMessage = t('toast.milestone-progress-exists', {
              count: parsed.count,
            });
          }
        } catch {
          // Not JSON, use as-is or fallback
          errorMessage = error || t('toast.delete-failed');
        }
      }
      toast.error(errorMessage);
    }
  };

  return (
    <>
      <DataTable
        columns={allColumns}
        data={allUsers}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
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
      />
      <CreateUserFormDialog
        open={isAdd}
        onOpenChange={setIsAdd}
        courseOptions={courseOptions}
        defaultRole="student"
      />
      <UpdateUserFormDialog
        open={isEdit.isEditing}
        onOpenChange={(open) =>
          setIsEdit({ isEditing: open, user: isEdit.user })
        }
        user={isEdit.user}
        courseOptions={courseOptions}
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
            ? t('delete-user-title')
            : t('delete-users-title')
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
