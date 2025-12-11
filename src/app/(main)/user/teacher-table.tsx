import { useUser } from '@/hooks/use-user';
import { createTeacherColumns } from './create-teacher-column';
import { User } from '@/types/user';
import React from 'react';
import { DataTable } from '../../../components/data-table/data-table';
import { CreateUserFormDialog } from './create-user-form';
import DeleteConfirmationDialog from '@/components/delete-dialog';

interface TeacherTableProps {
  userData: User[];
}

export const TeacherTable = ({ userData }: TeacherTableProps) => {
  const { searchQuery, setSearch: setSearchQuery } = useUser();

  const teacherColumns = createTeacherColumns().map((column) => {
    if (typeof column.header === 'string') {
      return {
        ...column,
        header: column.header,
      };
    }
    return column;
  });

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

  const filterTeacher = userData.filter((user) => user?.role === 'teacher');

  const onConfirmDelete = () => {
    console.log('confirm delete');
    console.log(isDelete.userIds);
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
          console.log('edit user', user);
        }}
        onDelete={(user) => {
          setIsDelete({ isDeleting: true, userIds: [user] });
          console.log('delete user', user);
        }}
        onMultiDelete={(user) => {
          setIsDelete({ isDeleting: true, userIds: user.map((u) => u.id) });
          console.log('delete multiple users', user);
        }}
      />
      <CreateUserFormDialog
        open={isAdd}
        onOpenChange={setIsAdd}
        courseOptions={[]}
        defaultRole="teacher"
      />
      <DeleteConfirmationDialog
        open={isDelete.isDeleting}
        onClose={() => setIsDelete({ isDeleting: false, userIds: undefined })}
        onConfirm={onConfirmDelete}
        isLoading={false}
        title="header"
        description="confirm"
        translationKey="user.delete"
        count={isDelete.userIds?.length}
      />
    </>
  );
};
