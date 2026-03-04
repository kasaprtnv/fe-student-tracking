import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { AppDispatch } from '@/store';

import {
  fetchTitles,
  fetchTitleById,
  createTitle,
  updateTitle,
  deleteTitle,
  fetchAllTitlesUsage,
} from '@/store/title/title.thunks';

import {
  selectTitleMap,
  selectFilteredTitlesId,
  selectAllTitleId,
  selectTitleState,
} from '@/store/title/title.selectors';

import { setSearchQuery, clearError } from '@/store/title/title.slice';
import { ITitle, ITitleCreateDTO } from '@/types/title';

export const useTitle = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Selectors
  const titleMap = useSelector(selectTitleMap);
  const filteredTitlesId = useSelector(selectFilteredTitlesId);
  const allTitleId = useSelector(selectAllTitleId);
  const { searchQuery, loader, storeAction, error } =
    useSelector(selectTitleState);

  const getTitleById = useCallback(
    (id?: string | null): ITitle | undefined => {
      return id ? titleMap[id] : undefined;
    },
    [titleMap],
  );

  // Fetch all titles
  const fetchAllTitles = useCallback(() => {
    return dispatch(fetchTitles()).unwrap();
  }, [dispatch]);

  // Fetch title by ID
  const fetchTitleDetails = useCallback(
    (id: string) => {
      if (titleMap[id]) return titleMap[id];
      return dispatch(fetchTitleById(id)).unwrap();
    },
    [dispatch, titleMap],
  );

  // Create a new title
  const createNewTitle = useCallback(
    (data: ITitleCreateDTO) => dispatch(createTitle(data)).unwrap(),
    [dispatch],
  );

  // Update an existing title
  const updateExistingTitle = useCallback(
    (id: string, data: Partial<ITitle>) =>
      dispatch(updateTitle({ id, data })).unwrap(),
    [dispatch],
  );

  // Delete a title
  const removeTitle = useCallback(
    (id: string) => dispatch(deleteTitle(id)).unwrap(),
    [dispatch],
  );

  // Check if title is in use
  const checkTitleInUse = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { titleService } = await import('@/services/title.service');
      return await titleService.checkTitleInUse(id);
    } catch (error) {
      console.error('Error checking title usage:', error);
      throw error;
    }
  }, []);

  // Fetch all titles usage status
  const fetchTitlesUsage = useCallback(async () => {
    try {
      const titleIds = Object.keys(titleMap);
      if (titleIds.length === 0) return {};
      return await dispatch(fetchAllTitlesUsage(titleIds)).unwrap();
    } catch {
      // Silently fail if API doesn't exist
      return {};
    }
  }, [dispatch, titleMap]);

  // Fetch all titles with usage status
  const fetchAllTitlesWithUsage = useCallback(async () => {
    const titlesResponse = await dispatch(fetchTitles()).unwrap();
    try {
      const titleIds = titlesResponse.data?.map((t: ITitle) => t.id) || [];
      if (titleIds.length > 0) {
        await dispatch(fetchAllTitlesUsage(titleIds)).unwrap();
      }
    } catch {
      // Silently fail if API doesn't exist
    }
  }, [dispatch]);

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
    titleMap,
    filteredTitlesId,
    allTitleId,
    searchQuery,
    loader,
    storeAction,
    error,

    // Getters
    getTitleById,

    // Actions
    fetchAllTitles,
    fetchAllTitlesWithUsage,
    fetchTitlesUsage,
    fetchTitleDetails,
    createNewTitle,
    updateExistingTitle,
    removeTitle,
    checkTitleInUse,
    setSearch,
    clearErr,
  };
};
