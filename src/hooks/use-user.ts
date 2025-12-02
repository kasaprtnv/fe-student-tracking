import { fetchUserProfile } from '@/store/auth/auth.thunks';
import { AppDispatch } from '@/store';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

export const useUser = () => {
  const dispatch = useDispatch<AppDispatch>();

  const getUserProfile = useCallback(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  return {
    getUserProfile,
  };
};
