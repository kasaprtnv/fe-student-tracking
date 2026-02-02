import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { AppDispatch } from '@/store';

import { fetchStepProgressReport } from '@/store/step-progress-report/step-progress-report.thunks';

import {
  selectStepProgressReportMap,
  selectStepProgressReportState,
  selectAllStepProgressReportIds,
  selectFilteredStepProgressReportIds,
} from '@/store/step-progress-report/step-progress-report.selectors';

import { setSearchQuery } from '@/store/step-progress-report/step-progress-report.slice';

import {
  IStepProgressReport,
  IStepProgressReportFilter,
} from '@/types/step-progress-report';

export const useStepProgressReport = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Selectors
  const stepProgressReportMap = useSelector(selectStepProgressReportMap);
  const filteredStepProgressReportIds = useSelector(
    selectFilteredStepProgressReportIds,
  );
  const allStepProgressReportIds = useSelector(selectAllStepProgressReportIds);
  const { searchQuery, loader } = useSelector(selectStepProgressReportState);

  const getStepProgressReportById = useCallback(
    (
      progressId: string | undefined | null,
    ): IStepProgressReport | undefined => {
      if (!progressId) return undefined;
      return stepProgressReportMap[progressId];
    },
    [stepProgressReportMap],
  );

  const fetchStepProgressReportByFilter = useCallback(
    async (filterData: IStepProgressReportFilter) => {
      const result = await dispatch(
        fetchStepProgressReport(filterData),
      ).unwrap();
      return result.data;
    },
    [dispatch],
  );

  const setSearch = useCallback(
    (query: string) => {
      dispatch(setSearchQuery(query));
    },
    [dispatch],
  );

  return {
    // Data
    stepProgressReportMap,
    filteredStepProgressReportIds,
    allStepProgressReportIds,
    getStepProgressReportById,
    // UI States
    searchQuery,
    loader,
    // Actions
    fetchStepProgressReportByFilter,
    setSearch,
  };
};
