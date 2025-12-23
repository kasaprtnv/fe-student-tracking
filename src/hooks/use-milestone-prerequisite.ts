'use client';

import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { AppDispatch } from '@/store';

// Thunks
import {
  fetchAllPrerequisites,
  fetchPrerequisiteByCourseId,
  createPrerequisite,
  createManyPrerequisites,
  updatePrerequisite,
  deletePrerequisite,
} from '@/store/milestone-prerequisite/milestone-prerequisite.thunks';

// Selectors
import {
  selectPrerequisiteMap,
  selectAllPrerequisiteIds,
  selectFilteredPrerequisiteIds,
  selectMilestonePrerequisiteState,
} from '@/store/milestone-prerequisite/milestone-prerequisite.selectors';

import {
  setPrerequisiteSearchQuery,
  clearError,
} from '@/store/milestone-prerequisite/milestone-prerequisite.slice';

import {
  IMilestonePrerequisite,
  MilestonePrerequisiteDTO,
} from '@/types/milestone-prerequisite';
import { UUID } from 'crypto';

export const useMilestonePrerequisite = () => {
  const dispatch = useDispatch<AppDispatch>();

  const prerequisiteMap = useSelector(selectPrerequisiteMap);
  const allPrerequisiteIds = useSelector(selectAllPrerequisiteIds);
  const filteredPrerequisiteIds = useSelector(selectFilteredPrerequisiteIds);

  const { searchQuery, storeAction, loader, error } = useSelector(
    selectMilestonePrerequisiteState,
  );

  const getPrerequisiteById = useCallback(
    (id?: string | null): IMilestonePrerequisite | undefined => {
      if (!id) return undefined;
      return prerequisiteMap[id];
    },
    [prerequisiteMap],
  );

  const fetchAll = useCallback(() => {
    return dispatch(fetchAllPrerequisites()).unwrap();
  }, [dispatch]);

  const fetchById = useCallback(
    (courseId: UUID) => {
      return dispatch(fetchPrerequisiteByCourseId(courseId)).unwrap();
    },
    [dispatch],
  );

  const createOne = useCallback(
    (data: MilestonePrerequisiteDTO) => {
      return dispatch(createPrerequisite(data)).unwrap();
    },
    [dispatch],
  );

  const createMany = useCallback(
    (items: MilestonePrerequisiteDTO[]) => {
      return dispatch(createManyPrerequisites(items)).unwrap();
    },
    [dispatch],
  );

  const update = useCallback(
    (courseId: string, data: MilestonePrerequisiteDTO[]) => {
      return dispatch(updatePrerequisite({ courseId, data })).unwrap();
    },
    [dispatch],
  );

  const removeOne = useCallback(
    (id: string) => {
      return dispatch(deletePrerequisite(id)).unwrap();
    },
    [dispatch],
  );

  const setSearch = useCallback(
    (query: string) => {
      dispatch(setPrerequisiteSearchQuery(query));
    },
    [dispatch],
  );

  const clearPrerequisiteError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    // Data
    prerequisiteMap,
    allPrerequisiteIds,
    filteredPrerequisiteIds,
    searchQuery,
    storeAction,
    loader,
    error,

    // Getter
    getPrerequisiteById,

    // CRUD Public API
    fetchAll,
    fetchById,
    createOne,
    createMany,
    update,
    removeOne,

    // UI state
    setSearch,
    clearPrerequisiteError,
  };
};
