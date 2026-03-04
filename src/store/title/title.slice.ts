import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  fetchTitles,
  fetchTitleById,
  createTitle,
  updateTitle,
  deleteTitle,
  fetchAllTitlesUsage,
} from './title.thunks';
import { ITitle, TitleState } from '@/types/title';

const initialState: TitleState = {
  titleMap: {},
  searchQuery: '',
  storeAction: 'none',
  loader: false,
  error: null,
};

const titleSlice = createSlice({
  name: 'title',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all titles
    builder
      .addCase(fetchTitles.pending, (state) => {
        state.loader = true;
        state.error = null;
      })
      .addCase(fetchTitles.fulfilled, (state, action) => {
        state.loader = false;
        state.titleMap = {};
        action.payload.data.forEach((title: ITitle) => {
          state.titleMap[title.id] = title;
        });
      })
      .addCase(fetchTitles.rejected, (state, action) => {
        state.loader = false;
        state.error = action.payload as string;
      });

    // Fetch title by ID
    builder
      .addCase(fetchTitleById.pending, (state) => {
        state.loader = true;
        state.error = null;
      })
      .addCase(fetchTitleById.fulfilled, (state, action) => {
        state.loader = false;
        state.titleMap[action.payload.id] = action.payload;
      })
      .addCase(fetchTitleById.rejected, (state, action) => {
        state.loader = false;
        state.error = action.payload as string;
      });

    // Create title
    builder
      .addCase(createTitle.pending, (state) => {
        state.storeAction = 'creating';
        state.error = null;
      })
      .addCase(createTitle.fulfilled, (state, action) => {
        state.storeAction = 'none';
        state.titleMap[action.payload.receivedData.id] =
          action.payload.receivedData;
      })
      .addCase(createTitle.rejected, (state, action) => {
        state.storeAction = 'none';
        state.error = action.payload as string;
      });

    // Update title
    builder
      .addCase(updateTitle.pending, (state) => {
        state.storeAction = 'updating';
        state.error = null;
      })
      .addCase(updateTitle.fulfilled, (state, action) => {
        state.storeAction = 'none';
        const updated = action.payload.updatedFields;
        if (updated.id && state.titleMap[updated.id]) {
          state.titleMap[updated.id] = {
            ...state.titleMap[updated.id],
            ...updated,
          };
        }
      })
      .addCase(updateTitle.rejected, (state, action) => {
        state.storeAction = 'none';
        state.error = action.payload as string;
      });

    // Delete title
    builder
      .addCase(deleteTitle.pending, (state) => {
        state.storeAction = 'deleting';
        state.error = null;
      })
      .addCase(deleteTitle.fulfilled, (state, action) => {
        state.storeAction = 'none';
        delete state.titleMap[action.payload.deletedId];
      })
      .addCase(deleteTitle.rejected, (state, action) => {
        state.storeAction = 'none';
        state.error = action.payload as string;
      });

    // Fetch all titles usage
    builder
      .addCase(fetchAllTitlesUsage.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchAllTitlesUsage.fulfilled, (state, action) => {
        const usageMap = action.payload as Record<string, boolean>;
        Object.keys(state.titleMap).forEach((titleId) => {
          if (state.titleMap[titleId]) {
            state.titleMap[titleId].isInUse = usageMap[titleId] ?? false;
          }
        });
      })
      .addCase(fetchAllTitlesUsage.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { setSearchQuery, clearError } = titleSlice.actions;
export default titleSlice.reducer;
