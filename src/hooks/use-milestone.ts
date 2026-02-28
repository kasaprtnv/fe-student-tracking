import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { AppDispatch } from '@/store';

import {
  fetchMilestoneById,
  fetchMilestones,
  searchMilestones,
  addMilestone,
  updateMilestone,
  deleteMilestone,
  deleteMilestones,
  fetchMilestonesWithStatusByCourseId,
  fetchMilestonesByCourseIdWithPosition,
  fetchMilestonesByCourseId,
  removeCourseMilestone,
  reorderMilestones,
} from '@/store/milestone/milestone.thunks';

import {
  selectMilestoneMap,
  selectFilteredMilestoneIds,
  selectAllMilestoneIds,
  selectMilestoneState,
  selectPagination,
  selectAllMilestonesFromMap,
} from '@/store/milestone/milestone.selectors';

import {
  setSearchQuery,
  clearError,
  setPaginationPage,
  setPaginationPageSize,
} from '@/store/milestone/milestone.slice';

import { IMilestone, IMilestoneCreateDTO } from '@/types/milestone';

export const useMilestone = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Selectors
  const milestoneMap = useSelector(selectMilestoneMap);
  const filteredMilestoneIds = useSelector(selectFilteredMilestoneIds);
  const allMilestoneIds = useSelector(selectAllMilestoneIds);
  const allMilestoneFormMap = useSelector(selectAllMilestonesFromMap);
  const pagination = useSelector(selectPagination);
  const { searchQuery, storeAction, loader, error } =
    useSelector(selectMilestoneState);

  //Get milestone by id
  const getMilestoneById = useCallback(
    (milestoneId: string | undefined | null): IMilestone | undefined => {
      if (!milestoneId) return undefined;
      return milestoneMap[milestoneId];
    },
    [milestoneMap],
  );

  const fetchAllMilestones = useCallback(
    (
      page?: number,
      pageSize?: number,
      sortBy?: string,
      sortOrder?: 'asc' | 'desc',
    ) => {
      return dispatch(
        fetchMilestones({ page, pageSize, sortBy, sortOrder }),
      ).unwrap();
    },
    [dispatch],
  );

  const searchForMilestones = useCallback(
    (
      searchQuery: string,
      page: number,
      pageSize: number,
      sortBy?: string,
      sortOrder?: 'asc' | 'desc',
    ) => {
      return dispatch(
        searchMilestones({ searchQuery, page, pageSize, sortBy, sortOrder }),
      ).unwrap();
    },
    [dispatch],
  );

  const fetchMilestoneDetails = useCallback(
    (milestoneId: string) => {
      return dispatch(fetchMilestoneById(milestoneId)).unwrap();
    },
    [dispatch],
  );

  const fetchMilestonesByCourse = useCallback(
    (courseId: string) => {
      return dispatch(fetchMilestonesByCourseId(courseId)).unwrap();
    },
    [dispatch],
  );

  const fetchMilestonesWithStatus = useCallback(
    (courseId: string, userId: string) => {
      return dispatch(
        fetchMilestonesWithStatusByCourseId({ courseId, userId }),
      ).unwrap();
    },
    [dispatch],
  );

  const createNewMilestone = useCallback(
    (data: IMilestoneCreateDTO) => {
      return dispatch(addMilestone(data)).unwrap();
    },
    [dispatch],
  );

  const updateExistingMilestone = useCallback(
    (id: string, data: Partial<IMilestone>) => {
      return dispatch(updateMilestone({ id, data })).unwrap();
    },
    [dispatch],
  );

  const reorderPositions = useCallback(
    (payload: { id: string; position: number; courseId: string }[]) => {
      return dispatch(reorderMilestones(payload)).unwrap();
    },
    [dispatch],
  );

  const fetchCourseMilestones = useCallback(
    (courseId: string) => {
      return dispatch(fetchMilestonesByCourseIdWithPosition(courseId)).unwrap();
    },
    [dispatch],
  );

  const removeCourseMilestoneFromCourse = useCallback(
    (courseId: string, milestoneId: string) => {
      return dispatch(
        removeCourseMilestone({ courseId, milestoneId }),
      ).unwrap();
    },
    [dispatch],
  );

  const removeMilestone = useCallback(
    (id: string) => {
      return dispatch(deleteMilestone(id)).unwrap();
    },
    [dispatch],
  );

  const removeMultipleMilestones = useCallback(
    (ids: string[]) => {
      return dispatch(deleteMilestones(ids)).unwrap();
    },
    [dispatch],
  );

  // UI state management
  const setSearch = useCallback(
    (query: string) => {
      dispatch(setSearchQuery(query));
    },
    [dispatch],
  );

  const clearCourseError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

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

  return {
    // Data
    milestoneMap,
    filteredMilestoneIds,
    allMilestoneIds,
    allMilestoneFormMap,
    pagination,
    searchQuery,
    storeAction,
    loader,
    error,

    // Methods
    getMilestoneById,
    fetchCourseMilestones,
    fetchMilestonesByCourse,
    removeCourseMilestoneFromCourse,
    // CRUD Operations
    fetchAllMilestones,
    searchForMilestones,
    fetchMilestoneDetails,
    fetchMilestonesWithStatus,
    createNewMilestone,
    updateExistingMilestone,
    removeMilestone,
    removeMultipleMilestones,
    reorderPositions,
    // UI State Methods
    setSearch,
    clearCourseError,
    setPage,
    setPageSize,
  };
};
