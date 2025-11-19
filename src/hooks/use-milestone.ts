import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import { useCallback } from 'react';
import {
  fetchMilestones,
  fetchMilestoneById,
  addMilestone,
  updateMilestone,
  deleteMilestone,
  deleteMilestones,
  addMilestoneToMap,
  removeMilestoneFromMap,
  updateMilestoneInMap,
  setMilestoneSearchQuery,
  clearError,
  selectMilestoneMap,
  selectFilteredMilestoneId,
  selectAllMilestoneId,
  selectMilestoneState,
} from '@/store/slices/milestone-silce.store';
import { IMilestone, IMilestoneCreateDTO } from '@/types/milestone';

export const useMilestone = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Selectors
  const milestoneMap = useSelector(selectMilestoneMap);
  const filteredMilestoneId = useSelector(selectFilteredMilestoneId);
  const allMilestoneId = useSelector(selectAllMilestoneId);
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

  // Fetch all milestone
  const fetchAllMilestones = useCallback(async (): Promise<IMilestone[]> => {
    const result = await dispatch(fetchMilestones());
    if (fetchMilestones.fulfilled.match(result)) {
      return result.payload.data;
    }
    throw new Error(result.error?.message || 'Failed to fetch milestones');
  }, [dispatch]);

  // Fetch milestone details
  const fetchMilestoneDetails = useCallback(
    async (milestoneId: string): Promise<IMilestone> => {
      if (milestoneMap[milestoneId]) {
        return milestoneMap[milestoneId];
      }

      const result = await dispatch(fetchMilestoneById(milestoneId));
      if (fetchMilestoneById.fulfilled.match(result)) {
        return result.payload;
      }
      throw new Error(
        result.error?.message || 'Failed to fetch milestone details',
      );
    },
    [dispatch, milestoneMap],
  );

  // Create a new milestone
  const createNewMilestone = useCallback(
    async (data: IMilestoneCreateDTO): Promise<IMilestone> => {
      const result = await dispatch(addMilestone(data));
      if (addMilestone.fulfilled.match(result)) {
        return result.payload.receivedData;
      }
      throw new Error(result.error?.message || 'Failed to create milestone');
    },
    [dispatch],
  );

  // Update an existing milestone
  const updateExistingMilestone = useCallback(
    async (
      id: string,
      data: Partial<IMilestone>,
    ): Promise<Partial<IMilestone>> => {
      const currentMilestone = getMilestoneById(id);
      if (currentMilestone) {
        dispatch(updateMilestoneInMap({ id, data }));
      }
      const result = await dispatch(updateMilestone({ id, data }));
      if (updateMilestone.fulfilled.match(result)) {
        return result.payload.data;
      }
      throw new Error(result.error?.message || 'Failed to update milestone');
    },
    [dispatch, getMilestoneById],
  );

  // Delete a course
  const removeMilestone = useCallback(
    async (id: string): Promise<boolean> => {
      const result = await dispatch(deleteMilestone(id));
      if (deleteMilestone.fulfilled.match(result)) {
        return true;
      }
      throw new Error(result.error?.message || 'Failed to delete milestone');
    },
    [dispatch],
  );

  // Delete multiple courses
  const removeMultipleMilestones = useCallback(
    async (ids: string[]): Promise<boolean> => {
      const result = await dispatch(deleteMilestones(ids));
      if (deleteMilestones.fulfilled.match(result)) {
        return true;
      }

      throw new Error(
        result.error?.message || 'Failed to delete multiple milestones',
      );
    },
    [dispatch],
  );

  // Manual cache management
  const addMilestoneToCache = useCallback(
    (course: IMilestone) => {
      dispatch(addMilestoneToMap(course));
    },
    [dispatch],
  );

  const removeMilestoneFromCache = useCallback(
    (id: string) => {
      dispatch(removeMilestoneFromMap(id));
    },
    [dispatch],
  );

  const updateMilestoneInCache = useCallback(
    (id: string, data: Partial<IMilestone>) => {
      dispatch(updateMilestoneInMap({ id, data }));
    },
    [dispatch],
  );

  // UI state management
  const setSearchQuery = useCallback(
    (query: string) => {
      dispatch(setMilestoneSearchQuery(query));
    },
    [dispatch],
  );

  const clearCourseError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    // Data
    milestoneMap,
    filteredMilestoneId,
    allMilestoneId,

    // UI State
    searchQuery,
    storeAction,
    loader,
    error,

    // Computed-like functions
    getMilestoneById,

    // Fetch actions
    fetchAllMilestones,
    fetchMilestoneDetails,

    // CRUD actions
    createNewMilestone,
    updateExistingMilestone,
    removeMilestone,
    removeMultipleMilestones,

    // Cache management
    addMilestoneToCache,
    removeMilestoneFromCache,
    updateMilestoneInCache,

    // UI actions
    setSearchQuery,
    clearCourseError,
  };
};
