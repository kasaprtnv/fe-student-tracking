import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  fetchAllPrerequisites,
  fetchPrerequisiteByCourseId,
  createPrerequisite,
  createManyPrerequisites,
  updatePrerequisite,
  deletePrerequisite,
} from './milestone-prerequisite.thunks';

import {
  IMilestonePrerequisite,
  MilestonePrerequisiteState,
} from '@/types/milestone-prerequisite';

const initialState: MilestonePrerequisiteState = {
  prerequisiteMap: {},
  searchQuery: '',
  storeAction: 'none',
  loader: false,
  error: null,
};

const milestonePrerequisiteSlice = createSlice({
  name: 'milestonePrerequisites',
  initialState,
  reducers: {
    setPrerequisiteSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllPrerequisites.pending, (state) => {
        state.loader = true;
        state.error = null;
      })
      .addCase(fetchAllPrerequisites.fulfilled, (state, action) => {
        state.loader = false;
        state.prerequisiteMap = {};

        action.payload.data.forEach((p: IMilestonePrerequisite) => {
          state.prerequisiteMap[p.id] = p;
        });
      })
      .addCase(fetchAllPrerequisites.rejected, (state, action) => {
        state.loader = false;
        state.error =
          (action.payload as string) || 'Failed to fetch prerequisites';
      });

    builder
      .addCase(fetchPrerequisiteByCourseId.pending, (state) => {
        state.loader = true;
        state.error = null;
      })
      .addCase(fetchPrerequisiteByCourseId.fulfilled, (state, action) => {
        state.loader = false;
        const item = action.payload.data;
        if (item?.id) {
          state.prerequisiteMap[item.id] = item;
        }
      })
      .addCase(fetchPrerequisiteByCourseId.rejected, (state, action) => {
        state.loader = false;
        state.error =
          (action.payload as string) || 'Failed to fetch prerequisite';
      });

    builder
      .addCase(createPrerequisite.pending, (state) => {
        state.storeAction = 'creating';
        state.error = null;
      })
      .addCase(createPrerequisite.fulfilled, (state, action) => {
        state.storeAction = 'none';
        const created = action.payload.receivedData;
        state.prerequisiteMap[created.id] = created;
      })
      .addCase(createPrerequisite.rejected, (state, action) => {
        state.storeAction = 'none';
        state.error =
          (action.payload as string) || 'Failed to create prerequisite';
      });

    builder
      .addCase(createManyPrerequisites.pending, (state) => {
        state.storeAction = 'creating';
        state.error = null;
      })
      .addCase(createManyPrerequisites.fulfilled, (state, action) => {
        state.storeAction = 'none';

        action.payload.receivedData.forEach((p) => {
          state.prerequisiteMap[p.id!] = {
            id: p.id!,
            targetMilestoneId: p.targetMilestoneId,
            targetStepId: p.targetStepId,
            requiredMilestoneId: p.requiredMilestoneId,
            requiredStepId: p.requiredStepId,
          };
        });
      })

      .addCase(createManyPrerequisites.rejected, (state, action) => {
        state.storeAction = 'none';
        state.error =
          (action.payload as string) ||
          'Failed to create multiple prerequisites';
      });

    builder
      .addCase(updatePrerequisite.pending, (state) => {
        state.storeAction = 'updating';
        state.error = null;
      })
      .addCase(updatePrerequisite.fulfilled, (state, action) => {
        state.storeAction = 'none';
        state.loader = false;

        const list = action.payload.updatedFields; // ✅ ตรงนี้

        state.prerequisiteMap = {};

        for (const item of list) {
          if (!item || !item.id) continue;
          state.prerequisiteMap[item.id] = item;
        }
      })

      .addCase(updatePrerequisite.rejected, (state, action) => {
        state.storeAction = 'none';
        state.error =
          (action.payload as string) || 'Failed to update prerequisite';
      });

    builder
      .addCase(deletePrerequisite.pending, (state) => {
        state.storeAction = 'deleting';
        state.error = null;
      })
      .addCase(deletePrerequisite.fulfilled, (state, action) => {
        state.storeAction = 'none';
        delete state.prerequisiteMap[action.payload.deletedId];
      })
      .addCase(deletePrerequisite.rejected, (state, action) => {
        state.storeAction = 'none';
        state.error =
          (action.payload as string) || 'Failed to delete prerequisite';
      });
  },
});

export const { setPrerequisiteSearchQuery, clearError } =
  milestonePrerequisiteSlice.actions;

export default milestonePrerequisiteSlice.reducer;
