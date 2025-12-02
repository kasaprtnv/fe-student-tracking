'use client';

import React from 'react';
import useSWR from 'swr';
import { RefreshCw } from 'lucide-react';
import { DataTable } from '@/components/data-table/data-table';
import { useUser } from '@/hooks/use-user';

export default function StudentPage() {
  const {
    // Data
    studentUsers,

    // Actions
    fetchStudents,

    // UI State
    searchQuery,
    setSearch,

    // Status
    loader,
    error,
    clearErr,
  } = useUser();

  // SWR for data fetching - ดึง users ที่มี role เป็น student
  useSWR(
    'USERS_STUDENTS',
    async () => {
      await fetchStudents();
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      revalidateIfStale: false,
    },
  );

  // Filter students by search query
  const filteredStudents = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return studentUsers;

    return studentUsers.filter((student) => {
      return (
        student.firstName?.toLowerCase().includes(query) ||
        student.lastName?.toLowerCase().includes(query) ||
        student.code?.toLowerCase().includes(query) ||
        student.email?.toLowerCase().includes(query) ||
        student.phone?.toLowerCase().includes(query)
      );
    });
  }, [studentUsers, searchQuery]);

  if (loader) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin" />
          <p>กำลังโหลดข้อมูลบัณฑิต...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center text-red-500">
          <p>เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
          <p className="text-sm">{error || 'กรุณาลองใหม่อีกครั้ง'}</p>
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
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">รายชื่อบัณฑิต</h1>
        <p className="text-muted-foreground">แสดงข้อมูลบัณฑิตทั้งหมดในระบบ</p>
      </div>

      <DataTable
        data={filteredStudents}
        columns={[
          { id: 'code', header: 'รหัสนิสิต', accessorKey: 'code' },
          { id: 'firstName', header: 'ชื่อ', accessorKey: 'firstName' },
          { id: 'lastName', header: 'นามสกุล', accessorKey: 'lastName' },
          { id: 'email', header: 'อีเมล', accessorKey: 'email' },
          { id: 'phone', header: 'เบอร์โทร', accessorKey: 'phone' },
          { id: 'degree', header: 'ระดับการศึกษา', accessorKey: 'degree' },
          { id: 'year', header: 'ชั้นปี', accessorKey: 'year' },
        ]}
        onSearch={setSearch}
        searchQuery={searchQuery}
        enabledMultiSelect={false}
      />
    </div>
  );
}
