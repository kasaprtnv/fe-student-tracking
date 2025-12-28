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
} from './user.thunks';
import { User, UserState } from '@/types/user';

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
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
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
    // Fetch all users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loader = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loader = false;
        state.userMap = {};
        const sortedUsers = action.payload.data.sort((a, b) =>
          a.firstName.localeCompare(b.firstName),
        );
        sortedUsers.forEach((user: User) => {
          state.userMap[user.id] = user;
        });
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
        state.userMap = {};
        const sortedUsers = action.payload.data.sort((a, b) =>
          a.firstName.localeCompare(b.firstName),
        );
        sortedUsers.forEach((user: User) => {
          state.userMap[user.id] = user;
        });
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
        state.userMap = {};
        const sortedUsers = action.payload.data.sort((a, b) =>
          a.firstName.localeCompare(b.firstName),
        );
        sortedUsers.forEach((user: User) => {
          state.userMap[user.id] = user;
        });
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
        if (action.payload && action.payload.id) {
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
        state.userMap[action.payload.receivedData.id] =
          action.payload.receivedData;
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
          state.userMap[id] = user;
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
        delete state.userMap[action.payload.deletedId];
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
        });
      })
      .addCase(deleteMultipleUsers.rejected, (state, action) => {
        state.storeAction = 'none';
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
} = userSlice.actions;

export default userSlice.reducer;
