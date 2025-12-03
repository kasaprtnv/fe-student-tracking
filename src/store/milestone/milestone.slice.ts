import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MilestoneState } from '@/types/milestone';
import {
  fetchMilestones,
  fetchMilestoneById,
  addMilestone,
  updateMilestone,
  deleteMilestone,
  deleteMilestones,
  fetchMilestonesWithStatusByCourseId,
  reorderMilestones,
} from './milestone.thunks';

const initialState: MilestoneState = {
  milestoneMap: {},
  allMilestoneIds: [],
  searchQuery: '',
  storeAction: 'none',
  loader: false,
  error: null,
};

const milestoneSlice = createSlice({
  name: 'milestones',
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
    // Fetch all milestones
    builder
      .addCase(fetchMilestones.pending, (state) => {
        state.loader = true;
        state.error = null;
      })
      .addCase(fetchMilestones.fulfilled, (state, action) => {
        state.loader = false;
        state.milestoneMap = {};
        const sortedMilestones = action.payload.data.sort((a, b) =>
          a.name.localeCompare(b.name),
        );
        sortedMilestones.forEach((milestone) => {
          state.milestoneMap[milestone.id] = milestone;
        });
        state.allMilestoneIds = sortedMilestones.map((ms) => ms.id);
      })
      .addCase(fetchMilestones.rejected, (state, action) => {
        state.loader = false;
        state.error = action.error.message || 'Failed to fetch milestones';
      });

    // Fetch milestone by ID
    builder
      .addCase(fetchMilestoneById.pending, (state) => {
        state.loader = true;
        state.error = null;
      })
      .addCase(fetchMilestoneById.fulfilled, (state, action) => {
        state.loader = false;
        state.milestoneMap[action.payload.data.id] = action.payload.data;
      })
      .addCase(fetchMilestoneById.rejected, (state, action) => {
        state.loader = false;
        state.error = action.error.message || 'Failed to fetch milestone';
      });

    builder
      .addCase(fetchMilestonesWithStatusByCourseId.pending, (state) => {
        state.loader = true;
        state.error = null;
      })
      .addCase(
        fetchMilestonesWithStatusByCourseId.fulfilled,
        (state, action) => {
          state.loader = false;
          state.milestoneMap = {};
          const sortedMilestones = action.payload.data.sort((a, b) =>
            a.name.localeCompare(b.name),
          );
          sortedMilestones.forEach((milestone) => {
            state.milestoneMap[milestone.id] = milestone;
          });
          state.allMilestoneIds = sortedMilestones.map((ms) => ms.id);
        },
      )
      .addCase(
        fetchMilestonesWithStatusByCourseId.rejected,
        (state, action) => {
          state.loader = false;
          state.error =
            action.error.message || 'Failed to fetch milestones with status';
        },
      );

    // Add milestone
    builder
      .addCase(addMilestone.pending, (state) => {
        state.storeAction = 'creating';
        state.error = null;
      })
      .addCase(addMilestone.fulfilled, (state, action) => {
        state.storeAction = 'none';
        state.milestoneMap[action.payload.receivedData.id] =
          action.payload.receivedData;
      })
      .addCase(addMilestone.rejected, (state, action) => {
        state.storeAction = 'none';
        state.error = action.error.message || 'Failed to create milestone';
      });

    // Update milestone
    builder
      .addCase(updateMilestone.pending, (state) => {
        state.storeAction = 'updating';
        state.error = null;
      })
      .addCase(updateMilestone.fulfilled, (state, action) => {
        state.storeAction = 'none';
        const updatedMilestone = action.payload.updatedFields;
        if (updatedMilestone.id && state.milestoneMap[updatedMilestone.id]) {
          state.milestoneMap[updatedMilestone.id] = {
            ...state.milestoneMap[updatedMilestone.id],
            ...updatedMilestone,
          };
        }
      })
      .addCase(updateMilestone.rejected, (state, action) => {
        state.storeAction = 'none';
        state.error = action.error.message || 'Failed to update milestone';
      });

    builder
      .addCase(reorderMilestones.pending, (state) => {
        state.loader = true;
        state.storeAction = 'reorder';
      })
      .addCase(reorderMilestones.fulfilled, (state, action) => {
        state.loader = false;
        state.storeAction = null;

        // Update local state ordering
        const updates = action.payload.payload;
        updates.forEach(({ id, position }) => {
          if (state.milestoneMap[id]) {
            state.milestoneMap[id].position = position;
          }
        });

        state.allMilestoneIds = Object.keys(state.milestoneMap).sort((a, b) => {
          const posA = state.milestoneMap[a].position ?? 999999;
          const posB = state.milestoneMap[b].position ?? 999999;
          return posA - posB;
        });
      })
      .addCase(reorderMilestones.rejected, (state, action) => {
        state.loader = false;
        state.error = action.payload as string;
      });

    // Delete milestone
    builder
      .addCase(deleteMilestone.pending, (state) => {
        state.storeAction = 'deleting';
        state.error = null;
      })
      .addCase(deleteMilestone.fulfilled, (state, action) => {
        state.storeAction = 'none';
        delete state.milestoneMap[action.payload.deletedId];
      })
      .addCase(deleteMilestone.rejected, (state, action) => {
        state.storeAction = 'none';
        state.error = action.error.message || 'Failed to delete milestone';
      });

    // Delete multiple milestones
    builder
      .addCase(deleteMilestones.pending, (state) => {
        state.storeAction = 'deleting';
        state.error = null;
      })
      .addCase(deleteMilestones.fulfilled, (state, action) => {
        state.storeAction = 'none';
        action.payload.deletedIds.forEach((id) => {
          delete state.milestoneMap[id];
        });
      })
      .addCase(deleteMilestones.rejected, (state, action) => {
        state.storeAction = 'none';
        state.error = action.error.message || 'Failed to delete milestones';
      });
  },
});

export const { setSearchQuery, clearError } = milestoneSlice.actions;

export default milestoneSlice.reducer;
