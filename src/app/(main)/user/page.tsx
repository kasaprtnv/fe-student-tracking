'use client';

import React from 'react';
import useSWR from 'swr';
import { DataTable } from '@/components/data-table/data-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser } from '@/hooks/use-user';
import { createAllStudentColumns } from './create-all-student-column';
import { createTeacherColumns } from './create-teacher-column';
import { TeacherTable } from './teacher-table';

const UserPage = () => {
  const { fetchAllUsers, filteredUserIds, getUserById } = useUser();

  useSWR(
    'fetch-users',
    async () => {
      await fetchAllUsers();
    },
    {
      revalidateOnFocus: false,
    },
  );

  const studentAndAllColumns = createAllStudentColumns().map((column) => {
    if (typeof column.header === 'string') {
      return {
        ...column,
        header: column.header,
      };
    }
    return column;
  });

  const alldata = filteredUserIds
    .map((id) => {
      const user = getUserById(id);
      if (!user) return undefined;
      return user;
    })
    .filter((user) => user !== undefined);

  const filterStudent = alldata.filter((user) => user?.role === 'student');
  const filterTeacher = alldata.filter((user) => user?.role === 'teacher');

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">User Management</h1>
      <Tabs defaultValue="students" className="w-full">
        <TabsList>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
        </TabsList>
        <TabsContent value="students">
          <h2 className="mb-2 text-xl font-semibold">Student List</h2>
          <DataTable columns={studentAndAllColumns} data={filterStudent} />
        </TabsContent>
        <TabsContent value="teachers">
          <h2 className="mb-2 text-xl font-semibold">Teacher List</h2>
          <TeacherTable userData={filterTeacher} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserPage;
