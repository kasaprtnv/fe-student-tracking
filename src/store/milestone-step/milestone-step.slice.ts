import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  fetchMilestoneSteps,
  fetchMilestoneStepById,
  fetchMilestoneStepsByMilestoneId,
  createMilestoneStep,
  updateMilestoneStep,
  deleteMilestoneStep,
} from './milestone-step.thunks';
import { IMilestoneStep, MilestoneStepState } from '@/types/milestone-step';

const initialState: MilestoneStepState = {
  milestoneStepMap: {},
  searchQuery: '',
  storeAction: 'none',
  loader: false,
  error: null,
};

const milestoneStepSlice = createSlice({
  name: 'milestoneSteps',
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
    // Fetch all
    builder
      .addCase(fetchMilestoneSteps.pending, (state) => {
        state.loader = true;
        state.error = null;
      })
      .addCase(fetchMilestoneSteps.fulfilled, (state, action) => {
        state.loader = false;
        state.milestoneStepMap = {};
        const sortMilestoneSteps = action.payload.data.sort((a, b) =>
          a.name.localeCompare(b.name),
        );
        sortMilestoneSteps.forEach((step: IMilestoneStep) => {
          state.milestoneStepMap[step.id] = step;
        });
      })
      .addCase(fetchMilestoneSteps.rejected, (state, action) => {
        state.loader = false;
        state.error =
          (action.payload as string) || 'Failed to fetch milestone steps';
      });

    // Fetch by ID
    builder
      .addCase(fetchMilestoneStepById.pending, (state) => {
        state.loader = true;
        state.error = null;
      })
      .addCase(fetchMilestoneStepById.fulfilled, (state, action) => {
        state.loader = false;
        const step = action.payload;
        state.milestoneStepMap[step.id] = step;
      })
      .addCase(fetchMilestoneStepById.rejected, (state, action) => {
        state.loader = false;
        state.error =
          (action.payload as string) || 'Failed to fetch milestone step';
      });

    // Fetch by Milestone ID
    builder
      .addCase(fetchMilestoneStepsByMilestoneId.pending, (state) => {
        state.loader = true;
        state.error = null;
      })
      .addCase(fetchMilestoneStepsByMilestoneId.fulfilled, (state, action) => {
        state.loader = false;
        action.payload.data.forEach((step: IMilestoneStep) => {
          state.milestoneStepMap[step.id] = step;
        });
      })
      .addCase(fetchMilestoneStepsByMilestoneId.rejected, (state, action) => {
        state.loader = false;
        state.error =
          (action.payload as string) ||
          'Failed to fetch milestone steps by milestone ID';
      });

    // Create
    builder
      .addCase(createMilestoneStep.pending, (state) => {
        state.storeAction = 'creating';
        state.error = null;
      })
      .addCase(createMilestoneStep.fulfilled, (state, action) => {
        state.storeAction = 'none';
        state.milestoneStepMap[action.payload.receivedData.id] =
          action.payload.receivedData;
      })
      .addCase(createMilestoneStep.rejected, (state, action) => {
        state.storeAction = 'none';
        state.error =
          (action.payload as string) || 'Failed to create milestone step';
      });

    // Update
    builder
      .addCase(updateMilestoneStep.pending, (state) => {
        state.storeAction = 'updating';
        state.error = null;
      })
      .addCase(updateMilestoneStep.fulfilled, (state, action) => {
        state.storeAction = 'none';
        const updated = action.payload.updatedFields;
        if (updated.id && state.milestoneStepMap[updated.id]) {
          state.milestoneStepMap[updated.id] = {
            ...state.milestoneStepMap[updated.id],
            ...updated,
          };
        }
      })
      .addCase(updateMilestoneStep.rejected, (state, action) => {
        state.storeAction = 'none';
        state.error =
          (action.payload as string) || 'Failed to update milestone step';
      });

    // Delete
    builder
      .addCase(deleteMilestoneStep.pending, (state) => {
        state.storeAction = 'deleting';
        state.error = null;
      })
      .addCase(deleteMilestoneStep.fulfilled, (state, action) => {
        state.storeAction = 'none';
        delete state.milestoneStepMap[action.payload.deletedId];
      })
      .addCase(deleteMilestoneStep.rejected, (state, action) => {
        state.storeAction = 'none';
        state.error =
          (action.payload as string) || 'Failed to delete milestone step';
      });
  },
});

export const { setSearchQuery, clearError } = milestoneStepSlice.actions;
export default milestoneStepSlice.reducer;
