import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import { useCallback } from 'react';

import {
  fetchMilestoneSteps,
  fetchMilestoneStepById,
  fetchStepsByMilestoneId,
  createMilestoneStep,
  updateMilestoneStep,
  deleteMilestoneStep,
  deleteMilestoneSteps,
  addMilestoneStepToMap,
  removeMilestoneStepFromMap,
  updateMilestoneStepInMap,
  selectMilestoneStepMap,
  selectMilestoneStepState,
  selectStepsByMilestoneId,
} from '@/store/slices/milestonestep-slice.store';

import {
  IMilestoneStep,
  IMilestoneStepCreateDTO,
  IMilestoneStepUpdateDTO,
} from '@/types/milestonestep';

export const useMilestoneStep = () => {
  const dispatch = useDispatch<AppDispatch>();

  const stepMap = useSelector(selectMilestoneStepMap);
  const { loader, error, storeAction } = useSelector(selectMilestoneStepState);

  // GET by id
  const getStepById = useCallback(
    (id: string | undefined | null): IMilestoneStep | undefined => {
      if (!id) return undefined;
      return stepMap[id];
    },
    [stepMap],
  );

  // FETCH ALL
  const fetchAllSteps = useCallback(async () => {
    const result = await dispatch(fetchMilestoneSteps());
    if (fetchMilestoneSteps.fulfilled.match(result)) {
      return result.payload.data;
    }
    throw new Error(result.error?.message || 'Failed to fetch steps');
  }, [dispatch]);

  // FETCH BY ID (with cache)
  const fetchStepDetails = useCallback(
    async (id: string): Promise<IMilestoneStep> => {
      if (stepMap[id]) return stepMap[id];

      const result = await dispatch(fetchMilestoneStepById(id));
      if (fetchMilestoneStepById.fulfilled.match(result)) {
        return result.payload;
      }
      throw new Error(result.error?.message || 'Failed to fetch step');
    },
    [dispatch, stepMap],
  );

  // FETCH STEPS BY MILESTONE ID
  const fetchStepsForMilestone = useCallback(
    async (milestoneId: string) => {
      const result = await dispatch(fetchStepsByMilestoneId(milestoneId));
      if (fetchStepsByMilestoneId.fulfilled.match(result)) {
        return result.payload.steps;
      }

      throw new Error(result.error?.message || 'Failed to fetch steps');
    },
    [dispatch],
  );

  // CREATE
  const createStep = useCallback(
    async (data: IMilestoneStepCreateDTO) => {
      const result = await dispatch(createMilestoneStep(data));
      if (createMilestoneStep.fulfilled.match(result)) {
        return result.payload.receivedData;
      }
      throw new Error(result.error?.message || 'Failed to create step');
    },
    [dispatch],
  );

  // UPDATE
  const updateStep = useCallback(
    async (id: string, data: IMilestoneStepUpdateDTO) => {
      const result = await dispatch(updateMilestoneStep({ id, data }));
      if (updateMilestoneStep.fulfilled.match(result)) {
        return result.payload.data;
      }
      throw new Error(result.error?.message || 'Failed to update step');
    },
    [dispatch],
  );

  // DELETE SINGLE
  const removeStep = useCallback(
    async (id: string) => {
      const result = await dispatch(deleteMilestoneStep(id));
      if (deleteMilestoneStep.fulfilled.match(result)) return true;

      throw new Error(result.error?.message || 'Failed to delete step');
    },
    [dispatch],
  );

  // DELETE MULTIPLE
  const removeMultipleSteps = useCallback(
    async (ids: string[]) => {
      const result = await dispatch(deleteMilestoneSteps(ids));
      if (deleteMilestoneSteps.fulfilled.match(result)) return true;

      throw new Error(result.error?.message || 'Failed to delete steps');
    },
    [dispatch],
  );

  // CACHE ACTIONS
  const addStepToCache = useCallback(
    (step: IMilestoneStep) => dispatch(addMilestoneStepToMap(step)),
    [dispatch],
  );

  const removeStepFromCache = useCallback(
    (id: string) => dispatch(removeMilestoneStepFromMap(id)),
    [dispatch],
  );

  const updateStepInCache = useCallback(
    (id: string, data: Partial<IMilestoneStep>) =>
      dispatch(updateMilestoneStepInMap({ id, data })),
    [dispatch],
  );

  return {
    // Data
    stepMap,

    // UI state
    loader,
    error,
    storeAction,

    // Getters
    getStepById,

    // Fetching
    fetchAllSteps,
    fetchStepDetails,
    fetchStepsForMilestone,

    // CRUD
    createStep,
    updateStep,
    removeStep,
    removeMultipleSteps,

    // Cache
    addStepToCache,
    removeStepFromCache,
    updateStepInCache,
  };
};
