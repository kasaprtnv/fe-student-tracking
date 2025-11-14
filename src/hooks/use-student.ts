import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { AppDispatch } from '@/store';
import {
  fetchStudents,
  fetchStudentById,
  fetchStudentOptions,
  createStudent,
  updateStudent,
  deleteStudent,
  deleteStudents,
  importStudents,
  addToCache,
  removeFromCache,
  updateCache,
  clearError,
  setSearchQuery,
  selectStudentMap,
  selectFilteredStudentIds,
  selectAllStudentIds,
  selectStudentState,
} from '@/store/slices/student-slice.store';
import { Student } from '@/types/student';
import { SelectOption } from '@/types/index';

export const useStudent = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Selectors
  const studentMap = useSelector(selectStudentMap);
  const filteredStudentIds = useSelector(selectFilteredStudentIds);
  const allStudentIds = useSelector(selectAllStudentIds);
  const { searchQuery, storeAction, loader, error } =
    useSelector(selectStudentState);

  // Get student by ID (คล้าย computedFn ใน MobX)
  const getStudentById = useCallback(
    (studentId: string | undefined | null): Student | undefined => {
      if (!studentId) return undefined;
      return studentMap[studentId];
    },
    [studentMap],
  );

  // Get student identifier by ID
  const getStudentIdentifierById = useCallback(
    (studentId: string | undefined | null): string | undefined => {
      if (!studentId) return undefined;
      return studentMap[studentId]?.id;
    },
    [studentMap],
  );

  // Get all students from cache
  const getAllFromCache = useCallback((): Student[] => {
    return Object.values(studentMap);
  }, [studentMap]);

  // Get filtered students
  const getFilteredStudents = useCallback((): Student[] => {
    return (
      filteredStudentIds?.map((id) => studentMap[id]).filter(Boolean) || []
    );
  }, [filteredStudentIds, studentMap]);

  // Fetch actions
  const fetchAllStudents = useCallback(async (): Promise<Student[]> => {
    const result = await dispatch(fetchStudents());
    if (fetchStudents.fulfilled.match(result)) {
      return result.payload;
    }
    throw new Error('Failed to fetch students');
  }, [dispatch]);

  const fetchStudentDetails = useCallback(
    async (studentId: string): Promise<Student> => {
      // Check cache first
      if (studentMap[studentId]) {
        return studentMap[studentId];
      }

      const result = await dispatch(fetchStudentById(studentId));
      if (fetchStudentById.fulfilled.match(result)) {
        return result.payload;
      }
      throw new Error('Failed to fetch student details');
    },
    [dispatch, studentMap],
  );

  const fetchStudentOptionsList = useCallback(async (): Promise<
    SelectOption[]
  > => {
    const result = await dispatch(fetchStudentOptions());
    if (fetchStudentOptions.fulfilled.match(result)) {
      return result.payload;
    }
    throw new Error('Failed to fetch student options');
  }, [dispatch]);

  // CRUD actions
  const createNewStudent = useCallback(
    async (data: Omit<Student, 'id'>): Promise<Student> => {
      const result = await dispatch(createStudent(data));
      if (createStudent.fulfilled.match(result)) {
        return result.payload.receivedData;
      }
      throw new Error('Failed to create student');
    },
    [dispatch],
  );

  const updateExistingStudent = useCallback(
    async (id: string, data: Partial<Student>): Promise<Partial<Student>> => {
      // Optimistic update
      const currentStudent = getStudentById(id);
      if (currentStudent) {
        dispatch(updateCache({ id, data }));
      }

      try {
        const result = await dispatch(updateStudent({ id, data }));
        if (updateStudent.fulfilled.match(result)) {
          return result.payload.data;
        }
        throw new Error('Failed to update student');
      } catch (error) {
        // Revert optimistic update on error
        if (currentStudent) {
          dispatch(addToCache(currentStudent));
        }
        throw error;
      }
    },
    [dispatch, getStudentById],
  );

  const removeStudent = useCallback(
    async (id: string): Promise<boolean> => {
      const result = await dispatch(deleteStudent(id));
      return deleteStudent.fulfilled.match(result);
    },
    [dispatch],
  );

  const removeMultipleStudents = useCallback(
    async (ids: string[]): Promise<boolean> => {
      const result = await dispatch(deleteStudents(ids));
      return deleteStudents.fulfilled.match(result);
    },
    [dispatch],
  );

  const importMultipleStudents = useCallback(
    async (students: Omit<Student, 'id'>[]): Promise<Student[]> => {
      const result = await dispatch(importStudents(students));
      if (importStudents.fulfilled.match(result)) {
        return result.payload;
      }
      // Get detailed error message from the rejected action
      // payload contains the error message from rejectWithValue
      const errorMessage =
        (result.payload as string) ||
        result.error?.message ||
        'Failed to import students';
      throw new Error(errorMessage);
    },
    [dispatch],
  );

  // Manual cache management
  const addStudentToCache = useCallback(
    (student: Student) => {
      dispatch(addToCache(student));
    },
    [dispatch],
  );

  const removeStudentFromCache = useCallback(
    (id: string) => {
      dispatch(removeFromCache(id));
    },
    [dispatch],
  );

  const updateStudentInCache = useCallback(
    (id: string, data: Partial<Student>) => {
      dispatch(updateCache({ id, data }));
    },
    [dispatch],
  );

  // UI state management
  const updateSearchQuery = useCallback(
    (query: string) => {
      dispatch(setSearchQuery(query));
    },
    [dispatch],
  );

  const clearStudentError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    // Data
    studentMap,
    filteredStudentIds,
    allStudentIds,

    // UI State
    searchQuery,
    storeAction,
    loader,
    error,

    // Computed-like functions
    getStudentById,
    getStudentIdentifierById,
    getAllFromCache,
    getFilteredStudents,

    // Fetch actions
    fetchAllStudents,
    fetchStudentDetails,
    fetchStudentOptionsList,

    // CRUD actions
    createNewStudent,
    updateExistingStudent,
    removeStudent,
    removeMultipleStudents,
    importMultipleStudents,

    // Cache management
    addStudentToCache,
    removeStudentFromCache,
    updateStudentInCache,

    // UI actions
    updateSearchQuery,
    clearStudentError,
  };
};
