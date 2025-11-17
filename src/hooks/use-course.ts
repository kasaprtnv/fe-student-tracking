import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { AppDispatch } from '@/store';
import {
  fetchCourses,
  fetchCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  deleteCourses,
  addCourseToMap,
  removeCourseFromMap,
  updateCourseInMap,
  setCourseSearchQuery,
  clearError,
  selectCourseMap,
  selectFilteredCoursesId,
  selectAllCourseId,
  selectCourseState,
} from '@/store/slices/course-slice.store';
import { ICourse, ICourseCreateDTO } from '@/types/course';

export const useCourse = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Selectors
  const courseMap = useSelector(selectCourseMap);
  const filteredCoursesId = useSelector(selectFilteredCoursesId);
  const allCourseId = useSelector(selectAllCourseId);
  const { searchQuery, storeAction, loader, error } =
    useSelector(selectCourseState);

  // Get course by ID
  const getCourseById = useCallback(
    (courseId: string | undefined | null): ICourse | undefined => {
      if (!courseId) return undefined;
      return courseMap[courseId];
    },
    [courseMap],
  );

  // Fetch all courses
  const fetchAllCourses = useCallback(async (): Promise<ICourse[]> => {
    const result = await dispatch(fetchCourses());
    if (fetchCourses.fulfilled.match(result)) {
      return result.payload;
    }
    throw new Error(result.error?.message || 'Failed to fetch courses');
  }, [dispatch]);

  // Fetch course details
  const fetchCourseDetails = useCallback(
    async (courseId: string): Promise<ICourse> => {
      if (courseMap[courseId]) {
        return courseMap[courseId];
      }

      const result = await dispatch(fetchCourseById(courseId));
      if (fetchCourseById.fulfilled.match(result)) {
        return result.payload;
      }
      throw new Error(
        result.error?.message || 'Failed to fetch course details',
      );
    },
    [dispatch, courseMap],
  );

  // Create a new course
  const createNewCourse = useCallback(
    async (data: ICourseCreateDTO): Promise<ICourse> => {
      const result = await dispatch(createCourse(data));
      if (createCourse.fulfilled.match(result)) {
        return result.payload.receivedData;
      }
      throw new Error(result.error?.message || 'Failed to create course');
    },
    [dispatch],
  );

  // Update an existing course
  const updateExistingCourse = useCallback(
    async (id: string, data: Partial<ICourse>): Promise<Partial<ICourse>> => {
      const currentCourse = getCourseById(id);
      if (currentCourse) {
        dispatch(updateCourseInMap({ id, data }));
      }
      const result = await dispatch(updateCourse({ id, data }));
      if (updateCourse.fulfilled.match(result)) {
        return result.payload.data;
      }
      throw new Error(result.error?.message || 'Failed to update course');
    },
    [dispatch, getCourseById],
  );

  // Delete a course
  const removeCourse = useCallback(
    async (id: string): Promise<boolean> => {
      const result = await dispatch(deleteCourse(id));
      if (deleteCourse.fulfilled.match(result)) {
        return true;
      }
      throw new Error(result.error?.message || 'Failed to delete course');
    },
    [dispatch],
  );

  // Delete multiple courses
  const removeMultipleCourses = useCallback(
    async (ids: string[]): Promise<boolean> => {
      const result = await dispatch(deleteCourses(ids));
      console.log('result', result);
      if (deleteCourses.fulfilled.match(result)) {
        return true;
      }

      throw new Error(
        result.error?.message || 'Failed to delete multiple courses',
      );
    },
    [dispatch],
  );

  // Manual cache management
  const addCourseToCache = useCallback(
    (course: ICourse) => {
      dispatch(addCourseToMap(course));
    },
    [dispatch],
  );

  const removeCourseFromCache = useCallback(
    (id: string) => {
      dispatch(removeCourseFromMap(id));
    },
    [dispatch],
  );

  const updateCourseInCache = useCallback(
    (id: string, data: Partial<ICourse>) => {
      dispatch(updateCourseInMap({ id, data }));
    },
    [dispatch],
  );

  // UI state management
  const setSearchQuery = useCallback(
    (query: string) => {
      dispatch(setCourseSearchQuery(query));
    },
    [dispatch],
  );

  const clearCourseError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    // Data
    courseMap,
    filteredCoursesId,
    allCourseId,

    // UI State
    searchQuery,
    storeAction,
    loader,
    error,

    // Computed-like functions
    getCourseById,

    // Fetch actions
    fetchAllCourses,
    fetchCourseDetails,

    // CRUD actions
    createNewCourse,
    updateExistingCourse,
    removeCourse,
    removeMultipleCourses,

    // Cache management
    addCourseToCache,
    removeCourseFromCache,
    updateCourseInCache,

    // UI actions
    setSearchQuery,
    clearCourseError,
  };
};
