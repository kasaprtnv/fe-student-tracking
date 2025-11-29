import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { AppDispatch } from '@/store';
import {
  fetchUsers,
  fetchStudentUsers,
  fetchUserById,
  addToCache,
  removeFromCache,
  updateCache,
  clearError,
  setSearchQuery,
  selectUserMap,
  selectFilteredUserIds,
  selectAllUserIds,
  selectUserState,
  selectStudentUsers,
} from '@/store/user/user.slice';
import { User } from '@/types/user';

export const useUser = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Selectors
  const userMap = useSelector(selectUserMap);
  const filteredUserIds = useSelector(selectFilteredUserIds);
  const allUserIds = useSelector(selectAllUserIds);
  const studentUsers = useSelector(selectStudentUsers);
  const { searchQuery, storeAction, loader, error } =
    useSelector(selectUserState);

  // Get user by ID
  const getUserById = useCallback(
    (userId: string | undefined | null): User | undefined => {
      if (!userId) return undefined;
      return userMap[userId];
    },
    [userMap],
  );

  // Get all users from cache
  const getAllFromCache = useCallback((): User[] => {
    return Object.values(userMap);
  }, [userMap]);

  // Get filtered users
  const getFilteredUsers = useCallback((): User[] => {
    return filteredUserIds?.map((id) => userMap[id]).filter(Boolean) || [];
  }, [filteredUserIds, userMap]);

  // Get student users only
  const getStudentUsers = useCallback((): User[] => {
    return studentUsers;
  }, [studentUsers]);

  // Fetch actions
  const fetchAllUsers = useCallback(async (): Promise<User[]> => {
    const result = await dispatch(fetchUsers());
    if (fetchUsers.fulfilled.match(result)) {
      return result.payload;
    }
    throw new Error('Failed to fetch users');
  }, [dispatch]);

  const fetchStudents = useCallback(async (): Promise<User[]> => {
    const result = await dispatch(fetchStudentUsers());
    if (fetchStudentUsers.fulfilled.match(result)) {
      return result.payload;
    }
    throw new Error('Failed to fetch student users');
  }, [dispatch]);

  const fetchUserDetails = useCallback(
    async (userId: string): Promise<User> => {
      // Check cache first
      if (userMap[userId]) {
        return userMap[userId];
      }

      const result = await dispatch(fetchUserById(userId));
      if (fetchUserById.fulfilled.match(result)) {
        return result.payload;
      }
      throw new Error('Failed to fetch user details');
    },
    [dispatch, userMap],
  );

  // Manual cache management
  const addUserToCache = useCallback(
    (user: User) => {
      dispatch(addToCache(user));
    },
    [dispatch],
  );

  const removeUserFromCache = useCallback(
    (id: string) => {
      dispatch(removeFromCache(id));
    },
    [dispatch],
  );

  const updateUserInCache = useCallback(
    (id: string, data: Partial<User>) => {
      dispatch(updateCache({ id, data }));
    },
    [dispatch],
  );

  // UI state management
  const updateSearchQuery = useCallback(
    (query: string) => {
      dispatch(setSearchQuery(query));
    },
    [dispatch],
  );

  const clearUserError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    // Data
    userMap,
    filteredUserIds,
    allUserIds,
    studentUsers,

    // UI State
    searchQuery,
    storeAction,
    loader,
    error,

    // Computed-like functions
    getUserById,
    getAllFromCache,
    getFilteredUsers,
    getStudentUsers,

    // Fetch actions
    fetchAllUsers,
    fetchStudents,
    fetchUserDetails,

    // Cache management
    addUserToCache,
    removeUserFromCache,
    updateUserInCache,

    // UI actions
    updateSearchQuery,
    clearUserError,
  };
};
