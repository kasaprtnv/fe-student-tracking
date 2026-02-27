import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { AppDispatch } from '@/store';

import {
  fetchCourses,
  searchCourses,
  fetchCourseById,
  createCourse,
  createCourseWithStaff,
  updateCourse,
  deleteCourse,
  deleteCourses,
} from '@/store/course/course.thunks';

import {
  selectCourseMap,
  selectFilteredCoursesId,
  selectAllCourseId,
  selectCourseState,
  selectPagination,
  selectAllCoursesFromMap,
} from '@/store/course/course.selectors';

import {
  setSearchQuery,
  clearError,
  setPaginationPage,
  setPaginationPageSize,
} from '@/store/course/course.slice';
import { ICourse, ICourseCreateDTO } from '@/types/course';

export const useCourse = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Selectors
  const courseMap = useSelector(selectCourseMap);
  const filteredCoursesId = useSelector(selectFilteredCoursesId);
  const allCourseId = useSelector(selectAllCourseId);
  const allCoursesFromMap = useSelector(selectAllCoursesFromMap);
  const pagination = useSelector(selectPagination);
  const { searchQuery, loader, storeAction, error } =
    useSelector(selectCourseState);

  const getCourseById = useCallback(
    (id?: string | null): ICourse | undefined => {
      return id ? courseMap[id] : undefined;
    },
    [courseMap],
  );

  // Fetch all courses
  const fetchAllCourses = useCallback(
    (
      page?: number,
      pageSize?: number,
      sortBy?: string,
      sortOrder?: 'asc' | 'desc',
    ) => {
      return dispatch(
        fetchCourses({ page, pageSize, sortBy, sortOrder }),
      ).unwrap();
    },
    [dispatch],
  );

  // Search courses
  const searchForCourses = useCallback(
    (
      searchQuery: string,
      page: number,
      pageSize: number,
      sortBy?: string,
      sortOrder?: 'asc' | 'desc',
    ) => {
      return dispatch(
        searchCourses({ searchQuery, page, pageSize, sortBy, sortOrder }),
      ).unwrap();
    },
    [dispatch],
  );

  // Fetch course by ID
  const fetchCourseDetails = useCallback(
    (id: string) => {
      if (courseMap[id]) return courseMap[id];
      return dispatch(fetchCourseById(id)).unwrap();
    },
    [dispatch, courseMap],
  );

  // Create a new course
  const createNewCourse = useCallback(
    (data: ICourseCreateDTO) => dispatch(createCourse(data)).unwrap(),
    [dispatch],
  );

  // Create a new course with staff
  const createNewCourseWithStaff = useCallback(
    (data: ICourseCreateDTO) => dispatch(createCourseWithStaff(data)).unwrap(),
    [dispatch],
  );

  // Update an existing course
  const updateExistingCourse = useCallback(
    (id: string, data: Partial<ICourse>) =>
      dispatch(updateCourse({ id, data })).unwrap(),
    [dispatch],
  );

  // Delete a course
  const removeCourse = useCallback(
    (id: string) => dispatch(deleteCourse(id)).unwrap(),
    [dispatch],
  );

  // Delete multiple courses
  const removeMultipleCourses = useCallback(
    (ids: string[]) => dispatch(deleteCourses(ids)).unwrap(),
    [dispatch],
  );

  // UI actions
  const setSearch = useCallback(
    (query: string) => {
      dispatch(setSearchQuery(query));
    },
    [dispatch],
  );

  const setPage = useCallback(
    (page: number) => {
      dispatch(setPaginationPage(page));
    },
    [dispatch],
  );

  const setPageSize = useCallback(
    (pageSize: number) => {
      dispatch(setPaginationPageSize(pageSize));
    },
    [dispatch],
  );

  const clearErr = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    // State
    courseMap,
    filteredCoursesId,
    allCourseId,
    allCoursesFromMap,
    pagination,
    searchQuery,
    loader,
    storeAction,
    error,
    getCourseById,

    // Async Actions
    fetchAllCourses,
    searchForCourses,
    fetchCourseDetails,
    createNewCourse,
    createNewCourseWithStaff,
    updateExistingCourse,
    removeCourse,
    removeMultipleCourses,

    // UI Actions
    setSearch,
    setPage,
    setPageSize,
    clearErr,
  };
};
