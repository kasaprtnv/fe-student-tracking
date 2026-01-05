import { useUser } from '@/hooks/use-user';
import { useCourse } from '@/hooks/use-course';
import { useCourseStaff } from '@/hooks/use-course_staff';
import { createTeacherColumns } from './create-teacher-column';
import { User } from '@/types/user';
import { ICourseStaff } from '@/types/course-staff';
import React from 'react';
import { DataTable } from '../../../components/data-table/data-table';
import { CreateUserFormDialog } from './create-user-form';
import { UpdateUserFormDialog } from './update-user-form';
import DeleteConfirmationDialog from '@/components/delete-dialog';
import { SelectOption } from '@/types';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export const TeacherTable = () => {
  const {
    searchQuery,
    setSearch: setSearchQuery,
    deleteExistingUser,
    deleteExistingUsers,
    storeAction,
    userMap,
  } = useUser();
  const { allCourseId, getCourseById } = useCourse();
  const { fetchAllCourseStaff } = useCourseStaff();
  const [allCourseStaff, setAllCourseStaff] = React.useState<ICourseStaff[]>(
    [],
  );
  const t = useTranslations('user');
  const tColumn = useTranslations('column');

  // Fetch courses and course_staff on mount
  React.useEffect(() => {
    fetchAllCourseStaff().then((response) => {
      if (response.data) {
        setAllCourseStaff(response.data);
      }
    });
  }, [fetchAllCourseStaff]);

  // Refetch course_staff data (called after form save)
  const refetchCourseStaff = React.useCallback(() => {
    fetchAllCourseStaff().then((response) => {
      if (response.data) {
        setAllCourseStaff(response.data);
      }
    });
  }, [fetchAllCourseStaff]);

  // Get teacher data directly from Redux store userMap and enrich with managedCourses
  const filterTeacher = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return Object.values(userMap)
      .filter((user) => {
        if (user.role !== 'teacher') return false;
        if (!query) return true;
        // Create full name to allow searching like "นายสมชาย ใจดี"
        const fullName =
          `${user.title || ''}${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
        // Strip non-digit characters for phone search
        const queryDigits = query.replace(/\D/g, '');
        const phoneDigits = user.phone?.replace(/\D/g, '') || '';

        // Get managed courses for this teacher to enable course search
        const teacherCourseStaff = allCourseStaff.filter(
          (cs) => (cs as unknown as { userId: string }).userId === user.id,
        );
        const managedCoursesText = teacherCourseStaff
          .map((cs) => {
            const course = getCourseById(cs.courseId);
            return course
              ? `${course.code} - ${course.name}`.toLowerCase()
              : '';
          })
          .join(' ');

        return (
          user.title?.toLowerCase().includes(query) ||
          user.firstName?.toLowerCase().includes(query) ||
          user.lastName?.toLowerCase().includes(query) ||
          user.code?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          (queryDigits && phoneDigits.includes(queryDigits)) ||
          fullName.includes(query) ||
          managedCoursesText.includes(query)
        );
      })
      .map((user) => {
        // Find all course_staff for this teacher
        const teacherCourseStaff = allCourseStaff.filter(
          (cs) => (cs as unknown as { userId: string }).userId === user.id,
        );
        // Get course names for each managed course
        const managedCourses = teacherCourseStaff
          .map((cs) => {
            const course = getCourseById(cs.courseId);
            return course ? `${course.code} - ${course.name}` : null;
          })
          .filter((name): name is string => name !== null);

        return {
          ...user,
          managedCourses: managedCourses,
        };
      });
  }, [userMap, searchQuery, getCourseById, allCourseStaff]);

  // Create course options for dropdown
  const courseOptions: SelectOption[] = allCourseId
    .map((id) => {
      const course = getCourseById(id);
      if (!course) return undefined;
      return { label: `${course.code} - ${course.name}`, value: course.id };
    })
    .filter((option): option is SelectOption => option !== undefined);

  const teacherColumns = createTeacherColumns(tColumn);

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
        // Single delete
        await deleteExistingUser(isDelete.userIds[0]);
        toast.success(t('toast.deleted-successfully'));
      } else {
        // Multiple delete
        await deleteExistingUsers(isDelete.userIds);
        toast.success(t('toast.deleted-multiple-successfully'));
      }
      setIsDelete({ isDeleting: false, userIds: undefined });
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
        columns={teacherColumns}
        data={filterTeacher}
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
        defaultRole="teacher"
        onUserCreated={refetchCourseStaff}
      />
      <UpdateUserFormDialog
        open={isEdit.isEditing}
        onOpenChange={(open) =>
          setIsEdit({ isEditing: open, user: isEdit.user })
        }
        user={isEdit.user}
        courseOptions={courseOptions}
        allCourseStaff={allCourseStaff}
        onCourseStaffChange={refetchCourseStaff}
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
