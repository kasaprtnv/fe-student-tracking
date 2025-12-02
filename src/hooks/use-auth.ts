import { useSelector, useDispatch } from 'react-redux';
import {
  selectUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
} from '@/store/auth/auth.selectors';
import { login, logout, validateToken } from '@/store/auth/auth.thunks';
import { setUser, logoutLocal, clearAuthError } from '@/store/auth/auth.slice';
import { AppDispatch } from '@/store';
import { User } from '@/types/user';
import { useCallback } from 'react';

export const useAuth = () => {
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const dispatch = useDispatch<AppDispatch>();

  const loginUser = useCallback(
    (email: string, password: string) => dispatch(login({ email, password })),
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
    loginUser,
    logoutUser,
    setUserInfo,
    clearError,
    logoutLocalUser,
    validateToken: validateTokenAction,
  };
};
