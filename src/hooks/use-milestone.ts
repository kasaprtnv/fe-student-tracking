import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { AppDispatch } from '@/store';

import {
  fetchMilestoneById,
  fetchMilestones,
  addMilestone,
  updateMilestone,
  deleteMilestone,
  deleteMilestones,
  fetchMilestonesWithStatusByCourseId,
  reorderMilestones,
} from '@/store/milestone/milestone.thunks';

import {
  selectMilestoneMap,
  selectFilteredMilestoneIds,
  selectAllMilestoneIds,
  selectMilestoneState,
} from '@/store/milestone/milestone.selectors';

import { setSearchQuery, clearError } from '@/store/milestone/milestone.slice';

import { IMilestone, IMilestoneCreateDTO } from '@/types/milestone';

export const useMilestone = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Selectors
  const milestoneMap = useSelector(selectMilestoneMap);
  const filteredMilestoneIds = useSelector(selectFilteredMilestoneIds);
  const allMilestoneIds = useSelector(selectAllMilestoneIds);
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

  const fetchAllMilestones = useCallback(() => {
    return dispatch(fetchMilestones()).unwrap();
  }, [dispatch]);

  const fetchMilestoneDetails = useCallback(
    (milestoneId: string) => {
      return dispatch(fetchMilestoneById(milestoneId)).unwrap();
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

  return {
    // Data
    milestoneMap,
    filteredMilestoneIds,
    allMilestoneIds,
    searchQuery,
    storeAction,
    loader,
    error,

    // Methods
    getMilestoneById,

    // CRUD Operations
    fetchAllMilestones,
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
  };
};
