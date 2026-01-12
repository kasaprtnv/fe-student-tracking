import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { AppDispatch } from '@/store';

import {
  fetchTitles,
  fetchTitleById,
  createTitle,
  updateTitle,
  deleteTitle,
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
    fetchTitleDetails,
    createNewTitle,
    updateExistingTitle,
    removeTitle,
    setSearch,
    clearErr,
  };
};
