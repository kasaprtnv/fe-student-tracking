import { useSelector, useDispatch } from 'react-redux';
import {
  selectUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectAuthInitialized,
} from '@/store/auth/auth.selectors';
import { login, logout, validateToken } from '@/store/auth/auth.thunks';
import { setUser, logoutLocal, clearAuthError } from '@/store/auth/auth.slice';
import { AppDispatch } from '@/store';
import { useCallback } from 'react';
import { User } from '@/types/user';

export const useAuth = () => {
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const initialized = useSelector(selectAuthInitialized);
  const dispatch = useDispatch<AppDispatch>();

  const loginUser = useCallback(
    (username: string, password: string) =>
      dispatch(login({ username, password })),
    [dispatch],
  );
  const validateTokenAction = useCallback(
    () => dispatch(validateToken()),
    [dispatch],
  );
  const logoutUser = useCallback(() => dispatch(logout()), [dispatch]);
  const setUserInfo = useCallback(
    (userData: User) => dispatch(setUser(userData)),
    [dispatch],
  );
  const clearError = useCallback(() => dispatch(clearAuthError()), [dispatch]);
  const logoutLocalUser = useCallback(
    () => dispatch(logoutLocal()),
    [dispatch],
  );

  return {
    user,
    isAuthenticated,
    loading,
    error,
    initialized,
    loginUser,
    logoutUser,
    setUserInfo,
    clearError,
    logoutLocalUser,
    validateToken: validateTokenAction,
  };
};
