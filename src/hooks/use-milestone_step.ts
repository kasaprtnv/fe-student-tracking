import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { AppDispatch } from '@/store';

import {
  fetchMilestoneSteps,
  fetchMilestoneStepById,
  fetchMilestoneStepsByMilestoneId,
  createMilestoneStep,
  updateMilestoneStep,
  updateMultipleMilestoneSteps,
  deleteMilestoneStep,
} from '@/store/milestone-step/milestone-step.thunks';

import {
  selectMilestoneStepMap,
  selectFilteredMilestoneStepIds,
  selectAllMilestoneStepIds,
  selectMilestoneStepState,
} from '@/store/milestone-step/milestone-step.selectors';

import {
  setSearchQuery,
  clearError,
} from '@/store/milestone-step/milestone-step.slice';

import {
  IMilestoneStep,
  IMilestoneStepCreateDTO,
} from '@/types/milestone-step';

export const useMilestoneStep = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Selectors
  const milestoneStepMap = useSelector(selectMilestoneStepMap);
  const filteredMilestoneStepIds = useSelector(selectFilteredMilestoneStepIds);
  const allMilestoneStepIds = useSelector(selectAllMilestoneStepIds);
  const { searchQuery, loader, storeAction, error } = useSelector(
    selectMilestoneStepState,
  );

  // Getter
  const getMilestoneStepById = useCallback(
    (id?: string | null): IMilestoneStep | undefined => {
      return id ? milestoneStepMap[id] : undefined;
    },
    [milestoneStepMap],
  );

  const getMilestoneStepsByMilestoneId = useCallback(
    (milestoneId: string): IMilestoneStep[] => {
      return Object.values(milestoneStepMap).filter(
        (milestoneStep) => milestoneStep.milestoneId === milestoneId,
      );
    },
    [milestoneStepMap],
  );

  const fetchAllMilestoneSteps = useCallback(() => {
    return dispatch(fetchMilestoneSteps()).unwrap();
  }, [dispatch]);

  const fetchMilestoneStepDetails = useCallback(
    async (id: string) => {
      if (milestoneStepMap[id]) return milestoneStepMap[id];
      return dispatch(fetchMilestoneStepById(id)).unwrap();
    },
    [dispatch, milestoneStepMap],
  );

  const fetchMilestoneStepsByMilestone = useCallback(
    (milestoneId: string) =>
      dispatch(fetchMilestoneStepsByMilestoneId(milestoneId)).unwrap(),
    [dispatch],
  );

  const createNewMilestoneStep = useCallback(
    (data: IMilestoneStepCreateDTO) =>
      dispatch(createMilestoneStep(data)).unwrap(),
    [dispatch],
  );

  const updateExistingMilestoneStep = useCallback(
    (id: string, data: Partial<IMilestoneStep>) =>
      dispatch(updateMilestoneStep({ id, data })).unwrap(),
    [dispatch],
  );

  const updateMultiMilestoneSteps = useCallback(
    (data: IMilestoneStep[]) =>
      dispatch(updateMultipleMilestoneSteps(data)).unwrap(),
    [dispatch],
  );

  const deleteMilestoneStepById = useCallback(
    (id: string) => dispatch(deleteMilestoneStep(id)).unwrap(),
    [dispatch],
  );

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
    milestoneStepMap,
    filteredMilestoneStepIds,
    allMilestoneStepIds,
    searchQuery,
    loader,
    storeAction,
    error,

    // Getters
    getMilestoneStepById,
    getMilestoneStepsByMilestoneId,

    // Async Actions
    fetchAllMilestoneSteps,
    fetchMilestoneStepDetails,
    fetchMilestoneStepsByMilestone,
    createNewMilestoneStep,
    updateExistingMilestoneStep,
    updateMultiMilestoneSteps,
    deleteMilestoneStepById,

    // Sync Actions
    setSearch,
    clearErr,
  };
};
