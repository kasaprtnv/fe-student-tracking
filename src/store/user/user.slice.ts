import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  createSelector,
} from '@reduxjs/toolkit';
import { User, UserState } from '@/types/user';
import { userService } from '@/services/user.service';
import { RootState } from '@/store';

// Async thunks
export const fetchUsers = createAsyncThunk('users/fetchAll', async () => {
  const response = await userService.getAll();
  return response;
});

export const fetchStudentUsers = createAsyncThunk(
  'users/fetchStudents',
  async () => {
    const response = await userService.getStudents();
    return response;
  },
);

export const fetchUserById = createAsyncThunk(
  'users/fetchById',
  async (id: string) => {
    const response = await userService.getById(id);
    return response.data;
  },
);

export const createUser = createAsyncThunk(
  'users/create',
  async (data: Partial<User>) => {
    const response = await userService.createUser(data);
    return response.receivedData;
  },
);

export const updateUser = createAsyncThunk(
  'users/update',
  async ({ id, data }: { id: string; data: Partial<User> }) => {
    const response = await userService.updateUser(id, data);
    return { id, updatedFields: response.updatedFields };
  },
);

export const deleteUser = createAsyncThunk(
  'users/delete',
  async (id: string) => {
    const response = await userService.deleteUser(id);
    return response.deletedId;
  },
);

export const deleteMultipleUsers = createAsyncThunk(
  'users/deleteMultiple',
  async (ids: string[]) => {
    const response = await userService.deleteMultipleUsers(ids);
    return response.deletedIds;
  },
);

const initialState: UserState = {
  userMap: {},
  searchQuery: '',
  storeAction: 'none',
  loader: false,
  error: null,
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    // UI Actions
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },

    // Manual Cache Management
    addToCache: (state, action: PayloadAction<User>) => {
      state.userMap[action.payload.id] = action.payload;
    },
    removeFromCache: (state, action: PayloadAction<string>) => {
      delete state.userMap[action.payload];
    },
    updateCache: (
      state,
      action: PayloadAction<{ id: string; data: Partial<User> }>,
    ) => {
      const { id, data } = action.payload;
      if (state.userMap[id]) {
        state.userMap[id] = { ...state.userMap[id], ...data };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Users
      .addCase(fetchUsers.pending, (state) => {
        state.loader = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loader = false;
        const sortedUsers = action.payload.sort((a, b) =>
          a.firstName.localeCompare(b.firstName),
        );
        state.userMap = {};
        sortedUsers.forEach((user) => {
          state.userMap[user.id] = user;
        });
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loader = false;
        state.error = action.error.message || 'Failed to fetch users';
      })

      // Fetch Student Users
      .addCase(fetchStudentUsers.pending, (state) => {
        state.loader = true;
        state.error = null;
      })
      .addCase(fetchStudentUsers.fulfilled, (state, action) => {
        state.loader = false;
        const sortedUsers = action.payload.sort((a, b) =>
          a.firstName.localeCompare(b.firstName),
        );
        state.userMap = {};
        sortedUsers.forEach((user) => {
          state.userMap[user.id] = user;
        });
      })
      .addCase(fetchStudentUsers.rejected, (state, action) => {
        state.loader = false;
        state.error = action.error.message || 'Failed to fetch student users';
      })

      // Fetch by ID
      .addCase(fetchUserById.pending, (state) => {
        state.loader = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loader = false;
        state.userMap[action.payload.id] = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loader = false;
        state.error = action.error.message || 'Failed to fetch user';
      })

      // Create User
      .addCase(createUser.pending, (state) => {
        state.storeAction = 'creating';
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.storeAction = 'none';
        state.userMap[action.payload.id] = action.payload;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.storeAction = 'none';
        state.error = action.error.message || 'Failed to create user';
      })

      // Update User
      .addCase(updateUser.pending, (state) => {
        state.storeAction = 'updating';
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.storeAction = 'none';
        const { id, updatedFields } = action.payload;
        state.userMap[id] = { ...state.userMap[id], ...updatedFields };
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.storeAction = 'none';
        state.error = action.error.message || 'Failed to update user';
      })

      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.storeAction = 'deleting';
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.storeAction = 'none';
        delete state.userMap[action.payload];
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.storeAction = 'none';
        state.error = action.error.message || 'Failed to delete user';
      })

      // Delete Multiple Users
      .addCase(deleteMultipleUsers.pending, (state) => {
        state.storeAction = 'deleting';
        state.error = null;
      })
      .addCase(deleteMultipleUsers.fulfilled, (state, action) => {
        state.storeAction = 'none';
        action.payload.forEach((id) => {
          delete state.userMap[id];
        });
      })
      .addCase(deleteMultipleUsers.rejected, (state, action) => {
        state.storeAction = 'none';
        state.error = action.error.message || 'Failed to delete users';
      });
  },
});

// Selectors
export const selectUserMap = (state: RootState) => state.users.userMap;
export const selectSearchQuery = (state: RootState) => state.users.searchQuery;
export const selectUserState = (state: RootState) => state.users;

// Filtered Users
export const selectFilteredUserIds = createSelector(
  [selectUserMap, selectSearchQuery],
  (userMap, searchQuery) => {
    const users = Object.values(userMap);
    const query = searchQuery.trim().toLowerCase();

    if (!query) return users.map((u) => u.id);

    const filteredUsers = users.filter((user) => {
      return (
        user.firstName?.toLowerCase().includes(query) ||
        user.lastName?.toLowerCase().includes(query) ||
        user.code?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.phone?.toLowerCase().includes(query)
      );
    });

    return filteredUsers.map((u) => u.id);
  },
);

// Student Users Only
export const selectStudentUsers = createSelector([selectUserMap], (userMap) => {
  return Object.values(userMap).filter((user) => user.role === 'student');
});

// All User IDs
export const selectAllUserIds = createSelector([selectUserMap], (userMap) =>
  Object.keys(userMap),
);

export const {
  setSearchQuery,
  clearError,
  addToCache,
  removeFromCache,
  updateCache,
} = userSlice.actions;

export default userSlice.reducer;
