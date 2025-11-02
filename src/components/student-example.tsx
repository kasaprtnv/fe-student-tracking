'use client';

import { useStudent } from '@/hooks/use-student';
import { useEffect, useState } from 'react';

export default function StudentExample() {
  const {
    // Data
    getStudentById,
    getFilteredStudents,
    getAllFromCache,

    // Actions
    fetchAllStudents,
    fetchStudentDetails,
    createNewStudent,
    updateExistingStudent,
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

  useEffect(() => {
    // Fetch all students on component mount
    fetchAllStudents().catch(console.error);
  }, [fetchAllStudents]);

  const handleCreate = async () => {
    try {
      await createNewStudent({
        stu_id: Math.floor(Math.random() * 100000),
        firstname: 'John',
        surname: 'Doe',
      });
    } catch (error) {
      console.error('Failed to create student:', error);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await updateExistingStudent(id, {
        firstname: 'Updated Name',
      });
    } catch (error) {
      console.error('Failed to update student:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await removeStudent(id);
    } catch (error) {
      console.error('Failed to delete student:', error);
    }
  };

  const handleDeleteMultiple = async () => {
    if (selectedStudentIds.length === 0) return;

    try {
      await removeMultipleStudents(selectedStudentIds);
      setSelectedStudentIds([]);
    } catch (error) {
      console.error('Failed to delete students:', error);
    }
  };

  const filteredStudents = getFilteredStudents();

  if (loader && getAllFromCache().length === 0) {
    return <div>Loading students...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Student Management</h1>

      {error && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          Error: {error}
          <button onClick={clearStudentError} className="ml-2 underline">
            Clear
          </button>
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search students..."
          value={searchQuery}
          onChange={(e) => updateSearchQuery(e.target.value)}
          className="w-full max-w-md rounded border px-3 py-2"
        />
      </div>

      {/* Actions */}
      <div className="mb-4 space-x-2">
        <button
          onClick={handleCreate}
          disabled={storeAction === 'creating'}
          className="rounded bg-blue-500 px-4 py-2 text-white disabled:opacity-50"
        >
          {storeAction === 'creating' ? 'Creating...' : 'Create Student'}
        </button>

        {selectedStudentIds.length > 0 && (
          <button
            onClick={handleDeleteMultiple}
            disabled={storeAction === 'deleting'}
            className="rounded bg-red-500 px-4 py-2 text-white disabled:opacity-50"
          >
            {storeAction === 'deleting'
              ? 'Deleting...'
              : `Delete Selected (${selectedStudentIds.length})`}
          </button>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="mb-4 flex items-center space-x-4">
        <div>
          <label className="mr-2">Page:</label>
          <input
            placeholder="test"
            type="number"
            min="0"
            className="w-20 rounded border px-2 py-1"
          />
        </div>
      </div>

      {/* Active Students */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">
          Active Students ({filteredStudents.length})
        </h2>
        <div className="grid gap-4">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="flex items-center justify-between rounded border p-4"
            >
              <div className="flex items-center space-x-4">
                <input
                  placeholder="test2"
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
                        selectedStudentIds.filter((id) => id !== student.id),
                      );
                    }
                  }}
                />
                <div>
                  <h3 className="font-medium">
                    {student.firstname} {student.surname}
                  </h3>
                  <p className="text-gray-600">ID: {student.stu_id}</p>
                  {student.createdAt && (
                    <p className="text-sm text-gray-500">
                      Created:{' '}
                      {new Date(student.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-x-2">
                <button
                  onClick={() => handleUpdate(student.id)}
                  disabled={storeAction === 'updating'}
                  className="rounded bg-yellow-500 px-3 py-1 text-sm text-white disabled:opacity-50"
                >
                  {storeAction === 'updating' ? 'Updating...' : 'Update'}
                </button>
                <button
                  onClick={() => handleDelete(student.id)}
                  disabled={storeAction === 'deleting'}
                  className="rounded bg-red-500 px-3 py-1 text-sm text-white disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Debug Info */}
      <div className="mt-8 rounded bg-gray-100 p-4">
        <h3 className="mb-2 font-medium">Debug Info:</h3>
        <p>Total students in cache: {getAllFromCache().length}</p>
        <p>Filtered students: {filteredStudents.length}</p>
        <p>Search query: {searchQuery}</p>
        <p>Store action: {storeAction}</p>
      </div>
    </div>
  );
}
