import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { AppDispatch } from '@/store';

import {
  fetchCourseStaff,
  fetchCourseStaffById,
  fetchCourseStaffByCourseId,
  createCourseStaff,
  updateCourseStaff,
  deleteCourseStaff,
} from '@/store/course-staff/course-staff.thunk';

import {
  selectCourseStaffMap,
  selectAllCourseStaffId,
  selectCourseStaffSearchQuery,
  selectCourseStaffState,
} from '@/store/course-staff/course-staff.selectors';

import {
  setSearchQuery,
  clearError,
} from '@/store/course-staff/course-staff.slice';
import { ICourseStaff, ICourseStaffCreateDTO } from '@/types/course-staff';

export const useCourseStaff = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Selectors
  const courseStaffMap = useSelector(selectCourseStaffMap);
  const allCourseStaffId = useSelector(selectAllCourseStaffId);
  const searchQuery = useSelector(selectCourseStaffSearchQuery);
  const { loader, storeAction, error } = useSelector(selectCourseStaffState);

  const getCourseStaffById = useCallback(
    (id?: string | null): ICourseStaff | undefined => {
      return id ? courseStaffMap[id] : undefined;
    },
    [courseStaffMap],
  );

  // Fetch all course staff
  const fetchAllCourseStaff = useCallback(() => {
    return dispatch(fetchCourseStaff()).unwrap();
  }, [dispatch]);

  // Fetch course staff by ID
  const fetchCourseStaffDetails = useCallback(
    (id: string) => {
      if (courseStaffMap[id]) return courseStaffMap[id];
      return dispatch(fetchCourseStaffById(id)).unwrap();
    },
    [dispatch, courseStaffMap],
  );

  // Fetch course staff by course ID
  const fetchCourseStaffByCourse = useCallback(
    (courseId: string) => {
      return dispatch(fetchCourseStaffByCourseId(courseId)).unwrap();
    },
    [dispatch],
  );

  // Create a new course staff
  const createNewCourseStaff = useCallback(
    (data: ICourseStaffCreateDTO) => dispatch(createCourseStaff(data)).unwrap(),
    [dispatch],
  );

  // Update an existing course staff
  const updateExistingCourseStaff = useCallback(
    (id: string, data: Partial<ICourseStaff>) =>
      dispatch(updateCourseStaff({ id, data })).unwrap(),
    [dispatch],
  );

  // Delete a course staff
  const removeCourseStaff = useCallback(
    (id: string) => dispatch(deleteCourseStaff(id)).unwrap(),
    [dispatch],
  );

  // UI actions
  const setSearch = useCallback(
    (query: string) => {
      dispatch(setSearchQuery(query));
    },
    [dispatch],
  );

  const clearErr = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    // State
    courseStaffMap,
    allCourseStaffId,
    searchQuery,
    loader,
    storeAction,
    error,
    getCourseStaffById,

    // Async Actions
    fetchAllCourseStaff,
    fetchCourseStaffDetails,
    fetchCourseStaffByCourse,
    createNewCourseStaff,
    updateExistingCourseStaff,
    removeCourseStaff,

    // UI Actions
    setSearch,
    clearErr,
  };
};
