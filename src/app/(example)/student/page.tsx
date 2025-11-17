'use client';

import { useStudent } from '@/hooks/use-student';
import React, { useState } from 'react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import StudentForm from '@/components/student/student-form';
import { Student } from '@/types/student';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, RefreshCw } from 'lucide-react';
import { DataTable } from '@/components/data-table/data-table';

export default function StudentPage() {
  const {
    // Data
    getFilteredStudents,
    getAllFromCache,

    // Actions
    fetchAllStudents,
    removeStudent,
    removeMultipleStudents,

    // UI State
    searchQuery,
    updateSearchQuery,

    // Status
    loader,
    error,
    storeAction,

    clearStudentError,
  } = useStudent();

  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | undefined>();

  // SWR for data fetching
  useSWR(
    'STUDENTS_LIST',
    async () => {
      await fetchAllStudents();
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      revalidateIfStale: false,
    },
  );

  const handleOpenCreateForm = () => {
    setEditingStudent(undefined);
    setShowForm(true);
  };

  const handleOpenEditForm = (student: Student) => {
    setEditingStudent(student);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingStudent(undefined);
  };

  const handleFormSuccess = () => {
    handleCloseForm();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await removeStudent(id);
      } catch (error) {
        console.error('Failed to delete student:', error);
      }
    }
  };

  const handleDeleteMultiple = async () => {
    if (selectedStudentIds.length === 0) return;

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedStudentIds.length} students?`,
      )
    ) {
      try {
        await removeMultipleStudents(selectedStudentIds);
        setSelectedStudentIds([]);
      } catch (error) {
        console.error('Failed to delete students:', error);
      }
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudentIds(filteredStudents.map((s) => s.id));
    } else {
      setSelectedStudentIds([]);
    }
  };

  const filteredStudents = getFilteredStudents();

  React.useEffect(() => {
    console.log('Filtered Students:', filteredStudents);
    console.log('loader:', loader);
    console.log('getAllFromCache: ', getAllFromCache());
  }, [filteredStudents, loader, getAllFromCache]);

  if (loader) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin" />
          <p>Loading students...</p>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="container mx-auto py-8">
        <StudentForm
          mode={editingStudent ? 'edit' : 'create'}
          student={editingStudent}
          onSuccess={handleFormSuccess}
          onCancel={handleCloseForm}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Student Management</h1>
        <p className="text-muted-foreground">
          Manage your students and their information
        </p>
      </div>

      {error && (
        <Card className="border-destructive mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-destructive">{error}</p>
              <Button variant="outline" size="sm" onClick={clearStudentError}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <DataTable
        data={filteredStudents}
        columns={[
          { id: 'firstName', header: 'First Name', accessorKey: 'firstName' },
          { id: 'lastName', header: 'Last Name', accessorKey: 'lastName' },
          { id: 'degree', header: 'Degree', accessorKey: 'degree' },
        ]}
        onAdd={handleOpenCreateForm}
        onEdit={handleOpenEditForm}
        onDelete={handleDelete}
        onMultiDelete={handleDeleteMultiple}
      />

      {/* Search and Actions */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => updateSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleOpenCreateForm}
            disabled={storeAction === 'creating'}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Button>

          {selectedStudentIds.length > 0 && (
            <Button
              variant="destructive"
              onClick={handleDeleteMultiple}
              disabled={storeAction === 'deleting'}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete ({selectedStudentIds.length})
            </Button>
          )}
        </div>
      </div>

      {/* Students List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Active Students ({filteredStudents.length})</CardTitle>

            {filteredStudents.length > 0 && (
              <div className="flex items-center gap-2">
                <Input
                  type="checkbox"
                  checked={
                    selectedStudentIds.length === filteredStudents.length
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded"
                />
                <span className="text-muted-foreground text-sm">
                  Select All
                </span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">
              No students found.{' '}
              {searchQuery
                ? 'Try adjusting your search.'
                : 'Add your first student!'}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Input
                      type="checkbox"
                      checked={selectedStudentIds.includes(student.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudentIds([
                            ...selectedStudentIds,
                            student.id,
                          ]);
                        } else {
                          setSelectedStudentIds(
                            selectedStudentIds.filter(
                              (id) => id !== student.id,
                            ),
                          );
                        }
                      }}
                      className="rounded"
                    />

                    <div>
                      <h3 className="font-medium">
                        {student.firstName} {student.lastName}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        ID: {student.code}
                      </p>
                      {student.degree && (
                        <Badge variant="secondary" className="mt-1">
                          {student.degree}
                        </Badge>
                      )}
                      {student.createdAt && (
                        <p className="text-muted-foreground mt-1 text-xs">
                          Created:{' '}
                          {new Date(student.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEditForm(student)}
                      disabled={storeAction === 'updating'}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(student.id)}
                      disabled={storeAction === 'deleting'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debug Info */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <div>
              <p className="font-medium">Total Students:</p>
              <p className="text-muted-foreground">
                {getAllFromCache().length}
              </p>
            </div>
            <div>
              <p className="font-medium">Filtered Results:</p>
              <p className="text-muted-foreground">{filteredStudents.length}</p>
            </div>
            <div>
              <p className="font-medium">Search Query:</p>
              <p className="text-muted-foreground">{searchQuery || 'None'}</p>
            </div>
            <div>
              <p className="font-medium">Store Action:</p>
              <p className="text-muted-foreground">{storeAction}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
