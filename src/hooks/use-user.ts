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
  uploadUserProfileImage,
  searchUsers,
  searchStudents,
  searchTeachers,
  filterStudentUsers,
} from '@/store/user/user.thunks';
import { userService } from '@/services/user.service';

import {
  selectUserMap,
  selectFilteredUserIds,
  selectAllUserIds,
  selectUserState,
  selectStudentUsers,
  selectAllStudentUsers,
  selectPagination,
  selectStudentPagination,
  selectTeacherPagination,
  selectAllUsersFromMap,
  selectPaginatedUsersFromMap,
  selectPaginatedStudentsFromMap,
  selectPaginatedTeachersFromMap,
  selectFilteredStudentsFromMap,
  selectFilteredStudentPagination,
  selectFilteredStudentLoader,
} from '@/store/user/user.selectors';

import {
  addToCache,
  removeFromCache,
  updateCache,
  clearError,
  setSearchQuery,
  setPaginationPage,
  setPaginationPageSize,
  setStudentPaginationPage,
  setStudentPaginationPageSize,
  setTeacherPaginationPage,
  setTeacherPaginationPageSize,
  setFilteredStudentPaginationPage,
  setFilteredStudentPaginationPageSize,
} from '@/store/user/user.slice';
import { User, StudentFilterPayload } from '@/types/user';
import { fetchUserProfile } from '@/store/auth/auth.thunks';

export const useUser = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Selectors
  const userMap = useSelector(selectUserMap);
  const filteredUserIds = useSelector(selectFilteredUserIds);
  const allUserIds = useSelector(selectAllUserIds);
  const studentUsers = useSelector(selectStudentUsers);
  const allStudentUsers = useSelector(selectAllStudentUsers);
  const allUsersFromMap = useSelector(selectAllUsersFromMap);
  const paginatedUsersFromMap = useSelector(selectPaginatedUsersFromMap);
  const paginatedStudentsFromMap = useSelector(selectPaginatedStudentsFromMap);
  const paginatedTeachersFromMap = useSelector(selectPaginatedTeachersFromMap);
  const filteredStudentsFromMap = useSelector(selectFilteredStudentsFromMap);
  const filteredStudentPagination = useSelector(
    selectFilteredStudentPagination,
  );
  const filteredStudentLoader = useSelector(selectFilteredStudentLoader);
  const pagination = useSelector(selectPagination);
  const studentPagination = useSelector(selectStudentPagination);
  const teacherPagination = useSelector(selectTeacherPagination);
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
    (
      page?: number,
      pageSize?: number,
      sortBy?: string,
      sortOrder?: 'asc' | 'desc',
    ) => dispatch(fetchUsers({ page, pageSize, sortBy, sortOrder })).unwrap(),
    [dispatch],
  );

  // Search users
  const searchForUsers = useCallback(
    (
      searchQuery: string,
      page: number,
      pageSize: number,
      sortBy?: string,
      sortOrder?: 'asc' | 'desc',
    ) =>
      dispatch(
        searchUsers({ searchQuery, page, pageSize, sortBy, sortOrder }),
      ).unwrap(),
    [dispatch],
  );

  // Fetch student users
  const fetchStudents = useCallback(
    (
      page?: number,
      pageSize?: number,
      sortBy?: string,
      sortOrder?: 'asc' | 'desc',
    ) =>
      dispatch(
        fetchStudentUsers({ page, pageSize, sortBy, sortOrder }),
      ).unwrap(),
    [dispatch],
  );

  const fetchTeachers = useCallback(
    (
      page?: number,
      pageSize?: number,
      sortBy?: string,
      sortOrder?: 'asc' | 'desc',
    ) =>
      dispatch(
        fetchTeacherUsers({ page, pageSize, sortBy, sortOrder }),
      ).unwrap(),
    [dispatch],
  );

  // Search students
  const searchForStudents = useCallback(
    (
      searchQuery: string,
      page: number,
      pageSize: number,
      sortBy?: string,
      sortOrder?: 'asc' | 'desc',
    ) =>
      dispatch(
        searchStudents({ searchQuery, page, pageSize, sortBy, sortOrder }),
      ).unwrap(),
    [dispatch],
  );

  // Search teachers
  const searchForTeachers = useCallback(
    (
      searchQuery: string,
      page: number,
      pageSize: number,
      sortBy?: string,
      sortOrder?: 'asc' | 'desc',
    ) =>
      dispatch(
        searchTeachers({ searchQuery, page, pageSize, sortBy, sortOrder }),
      ).unwrap(),
    [dispatch],
  );

  // Filter students (for /students page with advanced filters)
  const fetchFilteredStudents = useCallback(
    (
      filters: StudentFilterPayload,
      page?: number,
      pageSize?: number,
      sortBy?: string,
      sortOrder?: 'asc' | 'desc',
    ) =>
      dispatch(
        filterStudentUsers({ filters, page, pageSize, sortBy, sortOrder }),
      ).unwrap(),
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

  // Upload profile image
  const uploadProfileImage = useCallback(
    ({ id, file }: { id: string; file: File }) =>
      dispatch(uploadUserProfileImage({ id, file })).unwrap(),
    [dispatch],
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

  const setPage = useCallback(
    (page: number) => {
      dispatch(setPaginationPage(page));
    },
    [dispatch],
  );

  const setPageSize = useCallback(
    (pageSize: number) => {
      dispatch(setPaginationPageSize(pageSize));
    },
    [dispatch],
  );

  const setStudentPage = useCallback(
    (page: number) => {
      dispatch(setStudentPaginationPage(page));
    },
    [dispatch],
  );

  const setStudentPageSize = useCallback(
    (pageSize: number) => {
      dispatch(setStudentPaginationPageSize(pageSize));
    },
    [dispatch],
  );

  const setTeacherPage = useCallback(
    (page: number) => {
      dispatch(setTeacherPaginationPage(page));
    },
    [dispatch],
  );

  const setTeacherPageSize = useCallback(
    (pageSize: number) => {
      dispatch(setTeacherPaginationPageSize(pageSize));
    },
    [dispatch],
  );

  const setFilteredStudentPage = useCallback(
    (page: number) => {
      dispatch(setFilteredStudentPaginationPage(page));
    },
    [dispatch],
  );

  const setFilteredStudentPageSize = useCallback(
    (pageSize: number) => {
      dispatch(setFilteredStudentPaginationPageSize(pageSize));
    },
    [dispatch],
  );

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
    allStudentUsers,
    allUsersFromMap,
    paginatedUsersFromMap,
    paginatedStudentsFromMap,
    paginatedTeachersFromMap,
    filteredStudentsFromMap,
    filteredStudentPagination,
    filteredStudentLoader,
    pagination,
    studentPagination,
    teacherPagination,
    searchQuery,
    storeAction,
    loader,
    error,
    getUserById,

    // Async Actions
    fetchAllUsers,
    searchForUsers,
    searchForStudents,
    searchForTeachers,
    fetchFilteredStudents,
    fetchStudents,
    fetchTeachers,
    fetchUserDetails,
    uploadProfileImage,
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
    setPage,
    setPageSize,
    setStudentPage,
    setStudentPageSize,
    setTeacherPage,
    setTeacherPageSize,
    setFilteredStudentPage,
    setFilteredStudentPageSize,
  };
};
