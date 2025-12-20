'use client';

import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { AppDispatch } from '@/store';

import {
  fetchDashboardStats,
  fetchGraduationStatsByYear,
} from '@/store/dashboard/dashboard.thunks';

import {
  selectDashboardState,
  selectDashboardStats,
  selectGraduationStats,
  selectDashboardLoader,
  selectDashboardError,
  selectTotalTeachers,
} from '@/store/dashboard/dashboard.selectors';

import {
  clearError,
  clearGraduationStats,
} from '@/store/dashboard/dashboard.slice';

export const useDashboard = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Selectors
  const dashboardState = useSelector(selectDashboardState);
  const stats = useSelector(selectDashboardStats);
  const graduationStats = useSelector(selectGraduationStats);
  const loader = useSelector(selectDashboardLoader);
  const error = useSelector(selectDashboardError);
  const totalTeachers = useSelector(selectTotalTeachers);

  // Fetch dashboard stats
  const fetchStats = useCallback(() => {
    return dispatch(fetchDashboardStats()).unwrap();
  }, [dispatch]);

  // Fetch graduation stats by year
  const fetchGraduationStats = useCallback(
    (courseId?: string, degree?: string) => {
      return dispatch(
        fetchGraduationStatsByYear({ courseId, degree }),
      ).unwrap();
    },
    [dispatch],
  );

  // Clear error
  const clearErr = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Clear graduation stats
  const clearGradStats = useCallback(() => {
    dispatch(clearGraduationStats());
  }, [dispatch]);

  return {
    // State
    dashboardState,
    stats,
    graduationStats,
    loader,
    error,
    totalTeachers,

    // Async Actions
    fetchStats,
    fetchGraduationStats,

    // UI Actions
    clearErr,
    clearGradStats,
  };
};
