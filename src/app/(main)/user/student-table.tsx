'use client';

import React from 'react';
import { DataTable } from '@/components/data-table/data-table';
import { useUser } from '@/hooks/use-user';
import { useCourse } from '@/hooks/use-course';
import { createAllStudentColumns } from './create-all-column';
import { CreateUserFormDialog } from './create-user-form';
import { UpdateUserFormDialog } from './update-user-form';
import DeleteConfirmationDialog from '@/components/delete-dialog';
import { SelectOption } from '@/types';
import { User } from '@/types/user';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export const StudentTable = () => {
  const {
    searchQuery,
    setSearch: setSearchQuery,
    deleteExistingUser,
    deleteExistingUsers,
    storeAction,
    userMap,
  } = useUser();
  const { allCourseId, getCourseById } = useCourse();
  const t = useTranslations('user');
  const tColumn = useTranslations('column');

  // Get student data directly from Redux store userMap and enrich with courseName
  const filterStudent = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return Object.values(userMap)
      .filter((user) => {
        if (user.role !== 'student') return false;
        if (!query) return true;
        return (
          user.firstName?.toLowerCase().includes(query) ||
          user.lastName?.toLowerCase().includes(query) ||
          user.code?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          user.phone?.toLowerCase().includes(query)
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
  }, [userMap, searchQuery, getCourseById]);

  // Create course options for dropdown
  const courseOptions: SelectOption[] = allCourseId
    .map((id) => {
      const course = getCourseById(id);
      if (!course) return undefined;
      return { label: `${course.code} - ${course.name}`, value: course.id };
    })
    .filter((option): option is SelectOption => option !== undefined);

  const studentColumns = createAllStudentColumns(tColumn);

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
  }>({
    isDeleting: false,
  });

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
      setIsDelete({ isDeleting: false, userIds: undefined });
    } catch (error) {
      console.error('Failed to delete user(s):', error);
      toast.error(t('toast.delete-failed'));
    }
  };

  return (
    <>
      <DataTable
        columns={studentColumns}
        data={filterStudent}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        onAdd={() => setIsAdd(true)}
        onEdit={(user) => {
          setIsEdit({ isEditing: true, user: user });
        }}
        onDelete={(userId) => {
          setIsDelete({ isDeleting: true, userIds: [userId] });
        }}
        onMultiDelete={(users) => {
          setIsDelete({ isDeleting: true, userIds: users.map((u) => u.id) });
        }}
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
      <DeleteConfirmationDialog
        open={isDelete.isDeleting}
        onClose={() => setIsDelete({ isDeleting: false, userIds: undefined })}
        onConfirm={onConfirmDelete}
        isLoading={storeAction === 'deleting'}
        title={
          isDelete.userIds?.length === 1
            ? 'delete-user-title'
            : 'delete-users-title'
        }
        description={
          (isDelete.userIds?.length || 0) === 1
            ? 'delete-user-description'
            : 'delete-users-description'
        }
        translationKey="user"
        count={isDelete.userIds?.length || 0}
      />
    </>
  );
};
