import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  fetchUsers,
  fetchStudentUsers,
  fetchUserById,
  fetchTeacherUsers,
  createUser,
  updateUser,
  deleteUser,
  deleteMultipleUsers,
  uploadUserProfileImage,
  searchUsers,
  searchStudents,
  searchTeachers,
  filterStudentUsers,
} from './user.thunks';
import { User, UserState } from '@/types/user';

const defaultPagination = {
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0,
};

const initialState: UserState = {
  userMap: {},
  paginatedUserMap: {},
  paginatedStudentMap: {},
  paginatedTeacherMap: {},
  filteredStudentMap: {},
  searchQuery: '',
  storeAction: 'none',
  loader: false,
  filteredStudentLoader: false,
  error: null,
  pagination: { ...defaultPagination },
  studentPagination: { ...defaultPagination },
  teacherPagination: { ...defaultPagination },
  filteredStudentPagination: { ...defaultPagination },
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setPaginationPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    setPaginationPageSize: (state, action: PayloadAction<number>) => {
      state.pagination.pageSize = action.payload;
      state.pagination.page = 1;
    },
    setStudentPaginationPage: (state, action: PayloadAction<number>) => {
      state.studentPagination.page = action.payload;
    },
    setStudentPaginationPageSize: (state, action: PayloadAction<number>) => {
      state.studentPagination.pageSize = action.payload;
      state.studentPagination.page = 1;
    },
    setTeacherPaginationPage: (state, action: PayloadAction<number>) => {
      state.teacherPagination.page = action.payload;
    },
    setTeacherPaginationPageSize: (state, action: PayloadAction<number>) => {
      state.teacherPagination.pageSize = action.payload;
      state.teacherPagination.page = 1;
    },
    setFilteredStudentPaginationPage: (
      state,
      action: PayloadAction<number>,
    ) => {
      state.filteredStudentPagination.page = action.payload;
    },
    setFilteredStudentPaginationPageSize: (
      state,
      action: PayloadAction<number>,
    ) => {
      state.filteredStudentPagination.pageSize = action.payload;
      state.filteredStudentPagination.page = 1;
    },
    addToCache: (state, action: PayloadAction<User>) => {
      state.paginatedUserMap[action.payload.id] = action.payload;
      if (action.payload.role === 'student') {
        state.paginatedStudentMap[action.payload.id] = action.payload;
      } else if (action.payload.role === 'teacher') {
        state.paginatedTeacherMap[action.payload.id] = action.payload;
      }
      if (action.payload.isActive !== false) {
        state.userMap[action.payload.id] = action.payload;
      }
    },
    removeFromCache: (state, action: PayloadAction<string>) => {
      delete state.userMap[action.payload];
      delete state.paginatedUserMap[action.payload];
      delete state.paginatedStudentMap[action.payload];
      delete state.paginatedTeacherMap[action.payload];
    },
    updateCache: (
      state,
      action: PayloadAction<{ id: string; data: Partial<User> }>,
    ) => {
      const { id, data } = action.payload;
      if (state.paginatedUserMap[id]) {
        state.paginatedUserMap[id] = { ...state.paginatedUserMap[id], ...data };
      }
      if (state.paginatedStudentMap[id]) {
        state.paginatedStudentMap[id] = {
          ...state.paginatedStudentMap[id],
          ...data,
        };
      }
      if (state.paginatedTeacherMap[id]) {
        state.paginatedTeacherMap[id] = {
          ...state.paginatedTeacherMap[id],
          ...data,
        };
      }
      if (state.userMap[id]) {
        if (data.isActive === false) {
          delete state.userMap[id];
        } else {
          state.userMap[id] = { ...state.userMap[id], ...data };
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch all users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loader = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loader = false;
        state.userMap = {};
        state.paginatedUserMap = {};
        const users = action.payload.data;
        // paginatedUserMap: store ALL data (no filter) for accurate pagination
        users.forEach((user: User) => {
          state.paginatedUserMap[user.id] = user;
        });
        // userMap: store only active users for other uses
        const activeUsers = users
          .filter((user: User) => user.isActive !== false)
          .sort((a, b) => a.firstName.localeCompare(b.firstName));
        activeUsers.forEach((user: User) => {
          state.userMap[user.id] = user;
        });
        if (action.payload.pagination) {
          state.pagination.total = action.payload.pagination.total || 0;
          state.pagination.totalPages =
            action.payload.pagination.totalPages || 0;
        }
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loader = false;
        state.error = action.payload as string;
      });

    // Fetch student users
    builder
      .addCase(fetchStudentUsers.pending, (state) => {
        state.loader = true;
        state.error = null;
      })
      .addCase(fetchStudentUsers.fulfilled, (state, action) => {
        state.loader = false;
        state.paginatedStudentMap = {};
        const users = action.payload.data;
        // paginatedStudentMap: store ALL fetched data for accurate pagination
        users.forEach((user: User) => {
          state.paginatedStudentMap[user.id] = user;
        });
        // Merge active users into userMap (for summary card count)
        users
          .filter((user: User) => user.isActive !== false)
          .forEach((user: User) => {
            state.userMap[user.id] = user;
          });
        if (action.payload.pagination) {
          state.studentPagination.total = action.payload.pagination.total || 0;
          state.studentPagination.totalPages =
            action.payload.pagination.totalPages || 0;
        }
      })
      .addCase(fetchStudentUsers.rejected, (state, action) => {
        state.loader = false;
        state.error = action.payload as string;
      });

    // Fetch teacher users
    builder
      .addCase(fetchTeacherUsers.pending, (state) => {
        state.loader = true;
        state.error = null;
      })
      .addCase(fetchTeacherUsers.fulfilled, (state, action) => {
        state.loader = false;
        state.paginatedTeacherMap = {};
        const users = action.payload.data;
        // paginatedTeacherMap: store ALL fetched data for accurate pagination
        users.forEach((user: User) => {
          state.paginatedTeacherMap[user.id] = user;
        });
        // Merge active users into userMap
        users
          .filter((user: User) => user.isActive !== false)
          .forEach((user: User) => {
            state.userMap[user.id] = user;
          });
        if (action.payload.pagination) {
          state.teacherPagination.total = action.payload.pagination.total || 0;
          state.teacherPagination.totalPages =
            action.payload.pagination.totalPages || 0;
        }
      })
      .addCase(fetchTeacherUsers.rejected, (state, action) => {
        state.loader = false;
        state.error = action.payload as string;
      });

    // Fetch user by ID
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.loader = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loader = false;
        if (
          action.payload &&
          action.payload.id &&
          action.payload.isActive !== false
        ) {
          state.userMap[action.payload.id] = action.payload;
        }
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loader = false;
        state.error = action.payload as string;
      });

    // Upload profile image
    builder
      .addCase(uploadUserProfileImage.pending, (state) => {
        state.storeAction = 'updating';
        state.error = null;
      })
      .addCase(uploadUserProfileImage.fulfilled, (state) => {
        state.storeAction = 'none';
      })
      .addCase(uploadUserProfileImage.rejected, (state, action) => {
        state.storeAction = 'none';
        state.error = action.payload as string;
      });

    // Create user
    builder
      .addCase(createUser.pending, (state) => {
        state.storeAction = 'creating';
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.storeAction = 'none';
        const newUser = action.payload.receivedData;
        state.paginatedUserMap[newUser.id] = newUser;
        if (newUser.role === 'student') {
          state.paginatedStudentMap[newUser.id] = newUser;
        } else if (newUser.role === 'teacher') {
          state.paginatedTeacherMap[newUser.id] = newUser;
        }
        if (newUser.isActive !== false) {
          state.userMap[newUser.id] = newUser;
        }
      })
      .addCase(createUser.rejected, (state, action) => {
        state.storeAction = 'none';
        state.error = action.payload as string;
      });

    // Update user
    builder
      .addCase(updateUser.pending, (state) => {
        state.storeAction = 'updating';
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.storeAction = 'none';
        const { id, user } = action.payload;
        if (id && user) {
          state.paginatedUserMap[id] = user;
          if (state.paginatedStudentMap[id]) {
            state.paginatedStudentMap[id] = user;
          }
          if (state.paginatedTeacherMap[id]) {
            state.paginatedTeacherMap[id] = user;
          }
          if (user.isActive === false) {
            delete state.userMap[id];
          } else {
            state.userMap[id] = user;
          }
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.storeAction = 'none';
        state.error = action.payload as string;
      });

    // Delete user
    builder
      .addCase(deleteUser.pending, (state) => {
        state.storeAction = 'deleting';
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.storeAction = 'none';
        const deletedId = action.payload.deletedId;
        delete state.userMap[deletedId];
        delete state.paginatedUserMap[deletedId];
        delete state.paginatedStudentMap[deletedId];
        delete state.paginatedTeacherMap[deletedId];
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.storeAction = 'none';
        state.error = action.payload as string;
      });

    // Delete multiple users
    builder
      .addCase(deleteMultipleUsers.pending, (state) => {
        state.storeAction = 'deleting';
        state.error = null;
      })
      .addCase(deleteMultipleUsers.fulfilled, (state, action) => {
        state.storeAction = 'none';
        action.payload.deletedIds.forEach((id: string) => {
          delete state.userMap[id];
          delete state.paginatedUserMap[id];
          delete state.paginatedStudentMap[id];
          delete state.paginatedTeacherMap[id];
        });
      })
      .addCase(deleteMultipleUsers.rejected, (state, action) => {
        state.storeAction = 'none';
        state.error = action.payload as string;
      });

    // Search users
    builder
      .addCase(searchUsers.pending, (state) => {
        state.loader = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.loader = false;
        state.userMap = {};
        state.paginatedUserMap = {};
        const users = action.payload.data;
        // paginatedUserMap: store ALL data (no filter) for accurate pagination
        users.forEach((user: User) => {
          state.paginatedUserMap[user.id] = user;
        });
        // userMap: store only active users for other uses
        const activeUsers = users
          .filter((user: User) => user.isActive !== false)
          .sort((a, b) => a.firstName.localeCompare(b.firstName));
        activeUsers.forEach((user: User) => {
          state.userMap[user.id] = user;
        });
        if (action.payload.pagination) {
          state.pagination.total = action.payload.pagination.total || 0;
          state.pagination.totalPages =
            action.payload.pagination.totalPages || 0;
          state.pagination.page = action.payload.pagination.page;
          state.pagination.pageSize = action.payload.pagination.pageSize;
        }
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.loader = false;
        state.error = action.payload as string;
      });

    // Search students
    builder
      .addCase(searchStudents.pending, (state) => {
        state.loader = true;
        state.error = null;
      })
      .addCase(searchStudents.fulfilled, (state, action) => {
        state.loader = false;
        state.paginatedStudentMap = {};
        const users = action.payload.data;
        users.forEach((user: User) => {
          state.paginatedStudentMap[user.id] = user;
        });
        users
          .filter((user: User) => user.isActive !== false)
          .forEach((user: User) => {
            state.userMap[user.id] = user;
          });
        if (action.payload.pagination) {
          state.studentPagination.total = action.payload.pagination.total || 0;
          state.studentPagination.totalPages =
            action.payload.pagination.totalPages || 0;
          state.studentPagination.page = action.payload.pagination.page;
          state.studentPagination.pageSize = action.payload.pagination.pageSize;
        }
      })
      .addCase(searchStudents.rejected, (state, action) => {
        state.loader = false;
        state.error = action.payload as string;
      });

    // Search teachers
    builder
      .addCase(searchTeachers.pending, (state) => {
        state.loader = true;
        state.error = null;
      })
      .addCase(searchTeachers.fulfilled, (state, action) => {
        state.loader = false;
        state.paginatedTeacherMap = {};
        const users = action.payload.data;
        users.forEach((user: User) => {
          state.paginatedTeacherMap[user.id] = user;
        });
        users
          .filter((user: User) => user.isActive !== false)
          .forEach((user: User) => {
            state.userMap[user.id] = user;
          });
        if (action.payload.pagination) {
          state.teacherPagination.total = action.payload.pagination.total || 0;
          state.teacherPagination.totalPages =
            action.payload.pagination.totalPages || 0;
          state.teacherPagination.page = action.payload.pagination.page;
          state.teacherPagination.pageSize = action.payload.pagination.pageSize;
        }
      })
      .addCase(searchTeachers.rejected, (state, action) => {
        state.loader = false;
        state.error = action.payload as string;
      });

    // Filter students (for /students page)
    builder
      .addCase(filterStudentUsers.pending, (state) => {
        state.filteredStudentLoader = true;
        state.error = null;
      })
      .addCase(filterStudentUsers.fulfilled, (state, action) => {
        state.filteredStudentLoader = false;
        state.filteredStudentMap = {};
        const users = action.payload.data;
        users.forEach((user: User) => {
          state.filteredStudentMap[user.id] = user;
        });
        // Also merge active users into userMap
        users
          .filter((user: User) => user.isActive !== false)
          .forEach((user: User) => {
            state.userMap[user.id] = user;
          });
        if (action.payload.pagination) {
          state.filteredStudentPagination.total =
            action.payload.pagination.total || 0;
          state.filteredStudentPagination.totalPages =
            action.payload.pagination.totalPages || 0;
          state.filteredStudentPagination.page = action.payload.pagination.page;
          state.filteredStudentPagination.pageSize =
            action.payload.pagination.pageSize;
        }
      })
      .addCase(filterStudentUsers.rejected, (state, action) => {
        state.filteredStudentLoader = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSearchQuery,
  clearError,
  addToCache,
  removeFromCache,
  updateCache,
  setPaginationPage,
  setPaginationPageSize,
  setStudentPaginationPage,
  setStudentPaginationPageSize,
  setTeacherPaginationPage,
  setTeacherPaginationPageSize,
  setFilteredStudentPaginationPage,
  setFilteredStudentPaginationPageSize,
} = userSlice.actions;

export default userSlice.reducer;
