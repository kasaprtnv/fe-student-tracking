'use client';

import React from 'react';
import useSWR from 'swr';
import {
  RefreshCw,
  Upload,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import { DataTable } from '@/components/data-table/data-table';
import { useUser } from '@/hooks/use-user';
import { useCourse } from '@/hooks/use-course';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User } from '@/types/user';
import { ColumnDef } from '@tanstack/react-table';
import StudentFormDialog from '@/components/user/student-form-dialog';
import TeacherFormDialog from '@/components/user/teacher-form-dialog';
import DeleteConfirmationDialog from '@/components/delete-dialog';
import { toast } from 'sonner';

// Action Column Component
const ActionCell = ({
  user,
  onEdit,
  onDelete,
}: {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}) => (
  <div className="flex items-center gap-2">
    <Button
      variant="ghost"
      size="icon"
      onClick={() => onEdit(user)}
      className="h-8 w-8"
    >
      <Pencil className="h-4 w-4" />
    </Button>
    <Button
      variant="ghost"
      size="icon"
      onClick={() => onDelete(user)}
      className="text-destructive hover:text-destructive h-8 w-8"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  </div>
);

// Create columns with actions
const createStudentColumns = (
  onEdit: (user: User) => void,
  onDelete: (user: User) => void,
): ColumnDef<User>[] => [
  {
    id: 'code',
    header: 'รหัสนิสิต',
    accessorKey: 'code',
    cell: ({ row }) => row.original.code || '-',
  },
  {
    id: 'fullName',
    header: 'ชื่อ-สกุล',
    accessorFn: (row) =>
      `${row.firstName || ''} ${row.lastName || ''}`.trim() || '-',
  },
  {
    id: 'email',
    header: 'อีเมล',
    accessorKey: 'email',
    cell: ({ row }) => row.original.email || '-',
  },
  {
    id: 'phone',
    header: 'เบอร์โทร',
    accessorKey: 'phone',
    cell: ({ row }) => row.original.phone || '-',
  },
  {
    id: 'degree',
    header: 'ระดับการศึกษา',
    accessorKey: 'degree',
    cell: ({ row }) => row.original.degree || '-',
  },
  {
    id: 'year',
    header: 'ระดับชั้นปี',
    accessorKey: 'year',
    cell: ({ row }) => row.original.year || '-',
  },
  {
    id: 'courseName',
    header: 'หลักสูตร',
    accessorKey: 'courseName',
    cell: ({ row }) => row.original.courseName || '-',
  },
  {
    id: 'enrollDate',
    header: 'วันที่ลงทะเบียน',
    accessorKey: 'createdAt',
    cell: ({ row }) => {
      const date = row.original.createdAt;
      if (!date) return '-';
      return new Date(date).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    },
  },
  {
    id: 'actions',
    header: 'จัดการ',
    cell: ({ row }) => (
      <ActionCell user={row.original} onEdit={onEdit} onDelete={onDelete} />
    ),
  },
];

// Create teacher columns with actions
const createTeacherColumns = (
  onEdit: (user: User) => void,
  onDelete: (user: User) => void,
): ColumnDef<User>[] => [
  {
    id: 'fullName',
    header: 'ชื่อ-สกุล',
    accessorFn: (row) =>
      `${row.firstName || ''} ${row.lastName || ''}`.trim() || '-',
  },
  {
    id: 'email',
    header: 'อีเมล',
    accessorKey: 'email',
    cell: ({ row }) => row.original.email || '-',
  },
  {
    id: 'phone',
    header: 'เบอร์โทร',
    accessorKey: 'phone',
    cell: ({ row }) => row.original.phone || '-',
  },
  {
    id: 'courseName',
    header: 'หลักสูตรที่รับผิดชอบ',
    accessorKey: 'courseName',
    cell: ({ row }) => row.original.courseName || '-',
  },
  {
    id: 'createdAt',
    header: 'วันที่เพิ่ม',
    accessorKey: 'createdAt',
    cell: ({ row }) => {
      const date = row.original.createdAt;
      if (!date) return '-';
      return new Date(date).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    },
  },
  {
    id: 'actions',
    header: 'จัดการ',
    cell: ({ row }) => (
      <ActionCell user={row.original} onEdit={onEdit} onDelete={onDelete} />
    ),
  },
];

export default function UsersPage() {
  const [activeTab, setActiveTab] = React.useState('all');
  const [searchQuery, setSearchQuery] = React.useState('');

  // Dialog states - separate for student and teacher
  const [isStudentFormOpen, setIsStudentFormOpen] = React.useState(false);
  const [isTeacherFormOpen, setIsTeacherFormOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isMultiDeleteOpen, setIsMultiDeleteOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [selectedUsersToDelete, setSelectedUsersToDelete] = React.useState<
    User[]
  >([]);
  const [formMode, setFormMode] = React.useState<'create' | 'edit'>('create');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    userMap,
    fetchAllUsers,
    createNewUser,
    updateExistingUser,
    deleteExistingUser,
    deleteExistingUsers,
    updateUserInCache,
    loader,
    error,
    clearErr,
    storeAction,
  } = useUser();

  const { getCourseById } = useCourse();

  // SWR for data fetching
  useSWR(
    'USERS_ALL',
    async () => {
      const result = await fetchAllUsers();
      return result;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      revalidateIfStale: false,
    },
  );

  const allUsers = Object.values(userMap);

  // Filter users - exclude admin
  const allUsersExceptAdmin = React.useMemo(
    () => allUsers.filter((user) => user.role !== 'admin'),
    [allUsers],
  );

  // Filter users by role
  const students = React.useMemo(
    () => allUsers.filter((user) => user.role === 'student'),
    [allUsers],
  );

  const teachers = React.useMemo(
    () => allUsers.filter((user) => user.role === 'teacher'),
    [allUsers],
  );

  // Filter by search query
  const filteredAll = React.useMemo(() => {
    if (!searchQuery) return allUsersExceptAdmin;
    const query = searchQuery.toLowerCase();
    return allUsersExceptAdmin.filter(
      (user) =>
        user.code?.toLowerCase().includes(query) ||
        user.firstName?.toLowerCase().includes(query) ||
        user.lastName?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query),
    );
  }, [allUsersExceptAdmin, searchQuery]);

  const filteredStudents = React.useMemo(() => {
    if (!searchQuery) return students;
    const query = searchQuery.toLowerCase();
    return students.filter(
      (user) =>
        user.code?.toLowerCase().includes(query) ||
        user.firstName?.toLowerCase().includes(query) ||
        user.lastName?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query),
    );
  }, [students, searchQuery]);

  const filteredTeachers = React.useMemo(() => {
    if (!searchQuery) return teachers;
    const query = searchQuery.toLowerCase();
    return teachers.filter(
      (user) =>
        user.firstName?.toLowerCase().includes(query) ||
        user.lastName?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query),
    );
  }, [teachers, searchQuery]);

  // Handlers
  const handleAddStudent = () => {
    setSelectedUser(null);
    setFormMode('create');
    setIsStudentFormOpen(true);
  };

  const handleAddTeacher = () => {
    setSelectedUser(null);
    setFormMode('create');
    setIsTeacherFormOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormMode('edit');
    if (user.role === 'teacher') {
      setIsTeacherFormOpen(true);
    } else {
      setIsStudentFormOpen(true);
    }
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (data: Partial<User>) => {
    setIsSubmitting(true);
    try {
      // Get courseName from course store
      const course = data.courseId ? getCourseById(data.courseId) : null;
      const courseName = course?.name || '';

      if (formMode === 'edit' && selectedUser) {
        await updateExistingUser(selectedUser.id, data);
        // Update cache with courseName
        updateUserInCache(selectedUser.id, { ...data, courseName });
        toast.success('แก้ไขข้อมูลผู้ใช้สำเร็จ');
      } else {
        const response = await createNewUser(data);
        // Add courseName to the new user in cache
        if (response?.receivedData?.id) {
          updateUserInCache(response.receivedData.id, { courseName });
        }
        toast.success('เพิ่มผู้ใช้สำเร็จ');
      }
      setIsStudentFormOpen(false);
      setIsTeacherFormOpen(false);
      setSelectedUser(null);
    } catch {
      toast.error(
        formMode === 'edit' ? 'แก้ไขข้อมูลไม่สำเร็จ' : 'เพิ่มผู้ใช้ไม่สำเร็จ',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      await deleteExistingUser(selectedUser.id);
      toast.success('ลบผู้ใช้สำเร็จ');
      setIsDeleteOpen(false);
      setSelectedUser(null);
    } catch {
      toast.error('ลบผู้ใช้ไม่สำเร็จ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImportFile = () => {
    console.log('Import file');
  };

  const handleMultiDelete = (selectedUsers: User[]) => {
    if (selectedUsers.length === 0) return;
    setSelectedUsersToDelete(selectedUsers);
    setIsMultiDeleteOpen(true);
  };

  const handleMultiDeleteConfirm = async () => {
    if (selectedUsersToDelete.length === 0) return;
    setIsSubmitting(true);
    try {
      const ids = selectedUsersToDelete.map((u) => u.id);
      await deleteExistingUsers(ids);
      toast.success(`ลบผู้ใช้ ${selectedUsersToDelete.length} คนสำเร็จ`);
      setIsMultiDeleteOpen(false);
      setSelectedUsersToDelete([]);
    } catch {
      toast.error('ลบผู้ใช้ไม่สำเร็จ');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create columns with handlers
  const studentColumns = React.useMemo(
    () => createStudentColumns(handleEditUser, handleDeleteUser),
    [],
  );

  const teacherColumns = React.useMemo(
    () => createTeacherColumns(handleEditUser, handleDeleteUser),
    [],
  );

  if (loader) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin" />
          <p>กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center text-red-500">
          <p>เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={clearErr}
            className="mt-4 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">จัดการข้อมูลผู้ใช้งาน</h1>
        <div className="flex gap-2">
          <Input
            placeholder="ค้นหารหัสนิสิต, ชื่อ, อีเมล..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[300px]"
          />
          <Button variant="outline" onClick={handleImportFile}>
            <Upload className="mr-2 h-4 w-4" />
            อัปโหลดไฟล์
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                เพิ่มผู้ใช้
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleAddStudent}>
                เพิ่มบัณฑิต
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleAddTeacher}>
                เพิ่มผู้รับผิดชอบหลักสูตร
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">
            ทั้งหมด ({allUsersExceptAdmin.length})
          </TabsTrigger>
          <TabsTrigger value="students">บัณฑิต ({students.length})</TabsTrigger>
          <TabsTrigger value="teachers">
            อาจารย์ ({teachers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <DataTable
            data={filteredAll}
            columns={studentColumns}
            enabledSearch={false}
            enabledMultiSelect={true}
            onMultiDelete={handleMultiDelete}
            getRowId={(row) => row.id}
          />
        </TabsContent>

        <TabsContent value="students" className="mt-0">
          <DataTable
            data={filteredStudents}
            columns={studentColumns}
            enabledSearch={false}
            enabledMultiSelect={true}
            onMultiDelete={handleMultiDelete}
            getRowId={(row) => row.id}
          />
        </TabsContent>

        <TabsContent value="teachers" className="mt-0">
          <DataTable
            data={filteredTeachers}
            columns={teacherColumns}
            enabledSearch={false}
            enabledMultiSelect={true}
            onMultiDelete={handleMultiDelete}
            getRowId={(row) => row.id}
          />
        </TabsContent>
      </Tabs>

      {/* Student Form Dialog */}
      <StudentFormDialog
        open={isStudentFormOpen}
        onClose={() => {
          setIsStudentFormOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={handleFormSubmit}
        user={selectedUser}
        isLoading={
          isSubmitting ||
          storeAction === 'creating' ||
          storeAction === 'updating'
        }
        mode={formMode}
      />

      {/* Teacher Form Dialog */}
      <TeacherFormDialog
        open={isTeacherFormOpen}
        onClose={() => {
          setIsTeacherFormOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={handleFormSubmit}
        user={selectedUser}
        isLoading={
          isSubmitting ||
          storeAction === 'creating' ||
          storeAction === 'updating'
        }
        mode={formMode}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDeleteConfirm}
        isLoading={isSubmitting || storeAction === 'deleting'}
        title="delete-user-title"
        description="delete-user-description"
        translationKey="user"
      />

      {/* Multi-Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={isMultiDeleteOpen}
        onClose={() => {
          setIsMultiDeleteOpen(false);
          setSelectedUsersToDelete([]);
        }}
        onConfirm={handleMultiDeleteConfirm}
        isLoading={isSubmitting || storeAction === 'deleting'}
        title="delete-users-title"
        description="delete-users-description"
        translationKey="user"
        count={selectedUsersToDelete.length}
      />
    </div>
  );
}
