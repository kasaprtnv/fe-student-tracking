import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { AppDispatch } from '@/store';

import {
  fetchCourses,
  fetchCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  deleteCourses,
} from '@/store/course/course.thunks';

import {
  selectCourseMap,
  selectFilteredCoursesId,
  selectAllCourseId,
  selectCourseState,
} from '@/store/course/course.selectors';

import { setSearchQuery, clearError } from '@/store/course/course.slice';
import { ICourse, ICourseCreateDTO } from '@/types/course';

export const useCourse = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Selectors
  const courseMap = useSelector(selectCourseMap);
  const filteredCoursesId = useSelector(selectFilteredCoursesId);
  const allCourseId = useSelector(selectAllCourseId);
  const { searchQuery, loader, storeAction, error } =
    useSelector(selectCourseState);

  const getCourseById = useCallback(
    (id?: string | null): ICourse | undefined => {
      return id ? courseMap[id] : undefined;
    },
    [courseMap],
  );

  // Fetch all courses
  const fetchAllCourses = useCallback(() => {
    return dispatch(fetchCourses()).unwrap();
  }, [dispatch]);

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

  const clearErr = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    // State
    courseMap,
    filteredCoursesId,
    allCourseId,
    searchQuery,
    loader,
    storeAction,
    error,
    getCourseById,

    // Async Actions
    fetchAllCourses,
    fetchCourseDetails,
    createNewCourse,
    updateExistingCourse,
    removeCourse,
    removeMultipleCourses,

    // UI Actions
    setSearch,
    clearErr,
  };
};
