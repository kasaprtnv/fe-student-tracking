import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { AppDispatch } from '@/store';

import {
  fetchUsers,
  fetchStudentUsers,
  fetchTeacherUsers,
  fetchUserById,
  createUser,
  updateUser,
  deleteUser,
  deleteMultipleUsers,
} from '@/store/user/user.thunks';
import { userService } from '@/services/user.service';

import {
  selectUserMap,
  selectFilteredUserIds,
  selectAllUserIds,
  selectUserState,
  selectStudentUsers,
} from '@/store/user/user.selectors';

import {
  addToCache,
  removeFromCache,
  updateCache,
  clearError,
  setSearchQuery,
} from '@/store/user/user.slice';
import { User } from '@/types/user';
import { fetchUserProfile } from '@/store/auth/auth.thunks';

export const useUser = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Selectors
  const userMap = useSelector(selectUserMap);
  const filteredUserIds = useSelector(selectFilteredUserIds);
  const allUserIds = useSelector(selectAllUserIds);
  const studentUsers = useSelector(selectStudentUsers);
  const { searchQuery, storeAction, loader, error } =
    useSelector(selectUserState);

  const getUserById = useCallback(
    (id?: string | null): User | undefined => {
      return id ? userMap[id] : undefined;
    },
    [userMap],
  );

  // Fetch all users
  const fetchAllUsers = useCallback(
    () => dispatch(fetchUsers()).unwrap(),
    [dispatch],
  );

  // Fetch student users
  const fetchStudents = useCallback(
    () => dispatch(fetchStudentUsers()).unwrap(),
    [dispatch],
  );

  const fetchTeachers = useCallback(
    () => dispatch(fetchTeacherUsers()).unwrap(),
    [dispatch],
  );

  // Fetch user by ID
  const fetchUserDetails = useCallback(
    (id: string) => {
      if (userMap[id]) return userMap[id];
      return dispatch(fetchUserById(id)).unwrap();
    },
    [dispatch, userMap],
  );

  // Get user profile
  const getUserProfile = useCallback(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  // Create a new user
  const createNewUser = useCallback(
    (data: Partial<User>) => dispatch(createUser(data)).unwrap(),
    [dispatch],
  );

  // Update an existing user
  const updateExistingUser = useCallback(
    (id: string, data: Partial<User>) =>
      dispatch(updateUser({ id, data })).unwrap(),
    [dispatch],
  );

  // Delete a user
  const deleteExistingUser = useCallback(
    (id: string) => dispatch(deleteUser(id)).unwrap(),
    [dispatch],
  );

  // Delete multiple users
  const deleteExistingUsers = useCallback(
    (ids: string[]) => dispatch(deleteMultipleUsers(ids)).unwrap(),
    [dispatch],
  );

  // Cache management
  const addUserToCache = useCallback(
    (user: User) => dispatch(addToCache(user)),
    [dispatch],
  );

  const removeUserFromCache = useCallback(
    (id: string) => dispatch(removeFromCache(id)),
    [dispatch],
  );

  const updateUserInCache = useCallback(
    (id: string, data: Partial<User>) => dispatch(updateCache({ id, data })),
    [dispatch],
  );

  // UI actions
  const setSearch = useCallback(
    (query: string) => dispatch(setSearchQuery(query)),
    [dispatch],
  );

  const clearErr = useCallback(() => dispatch(clearError()), [dispatch]);

  const getStudentProgressCount = useCallback(
    (userId: string) => userService.getStudentProgressCount(userId),
    [],
  );

  return {
    // State
    userMap,
    filteredUserIds,
    allUserIds,
    studentUsers,
    searchQuery,
    storeAction,
    loader,
    error,
    getUserById,

    // Async Actions
    fetchAllUsers,
    fetchStudents,
    fetchTeachers,
    fetchUserDetails,
    getUserProfile,
    createNewUser,
    updateExistingUser,
    deleteExistingUser,
    deleteExistingUsers,
    getStudentProgressCount,

    // Cache Actions
    addUserToCache,
    removeUserFromCache,
    updateUserInCache,

    // UI Actions
    setSearch,
    clearErr,
  };
};
