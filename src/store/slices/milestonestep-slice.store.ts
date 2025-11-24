// milestonestep-slice.store.ts

import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  createSelector,
} from '@reduxjs/toolkit';

import {
  IMilestoneStep,
  IMilestoneStepCreateDTO,
  IMilestoneStepUpdateDTO,
  MilestoneStepState,
} from '@/types/milestonestep';

import { milestonestepService } from '@/services/milestonestep.service';
import { RootState } from '..';

// --------------------------------------------------
// GET ALL MILESTONE STEPS
// --------------------------------------------------
export const fetchMilestoneSteps = createAsyncThunk(
  'milestonesteps/fetchAll',
  async () => {
    const res = await milestonestepService.getAllMilestoneSteps();
    return res;
  },
);

// --------------------------------------------------
// GET MILESTONE STEP BY ID
// --------------------------------------------------
export const fetchMilestoneStepById = createAsyncThunk(
  'milestonesteps/fetchById',
  async (id: string) => {
    const res = await milestonestepService.getMilestoneStepById(id);
    return res;
  },
);

// --------------------------------------------------
// GET STEPS BY MILESTONE ID
// --------------------------------------------------
export const fetchStepsByMilestoneId = createAsyncThunk(
  'milestonesteps/fetchByMilestoneId',
  async (milestoneId: string) => {
    const res =
      await milestonestepService.getMilestoneStepsByMilestoneId(milestoneId);

    return {
      milestoneId,
      steps: res.data, // ✔ res.data คือ array ของ steps
    };
  },
);

// --------------------------------------------------
// CREATE MILESTONE STEP
// --------------------------------------------------
export const createMilestoneStep = createAsyncThunk(
  'milestonesteps/create',
  async (data: IMilestoneStepCreateDTO) => {
    const res = await milestonestepService.createMilestoneStep(data);
    return res;
  },
);

// --------------------------------------------------
// UPDATE MILESTONE STEP
// --------------------------------------------------
export const updateMilestoneStep = createAsyncThunk(
  'milestonesteps/update',
  async ({ id, data }: { id: string; data: IMilestoneStepUpdateDTO }) => {
    const res = await milestonestepService.updateMilestoneStep(id, data);
    return { id, data: res.updatedFields ?? data };
  },
);

// --------------------------------------------------
// DELETE SINGLE STEP
// --------------------------------------------------
export const deleteMilestoneStep = createAsyncThunk(
  'milestonesteps/delete',
  async (id: string) => {
    await milestonestepService.deleteMilestoneStep(id);
    return id;
  },
);

// --------------------------------------------------
// DELETE MULTIPLE STEP
// --------------------------------------------------
export const deleteMilestoneSteps = createAsyncThunk(
  'milestonesteps/deleteMultiple',
  async (ids: string[]) => {
    await milestonestepService.deleteMilestoneStepsBulk(ids);
    return ids;
  },
);

// --------------------------------------------------
// INITIAL STATE
// --------------------------------------------------
const initialState: MilestoneStepState = {
  milestonestepMap: {},
  storeAction: 'none',
  loader: false,
  error: null,
};

// --------------------------------------------------
// SLICE
// --------------------------------------------------
const milestoneStepSlice = createSlice({
  name: 'milestonesteps',
  initialState,
  reducers: {
    addMilestoneStepToMap: (state, action: PayloadAction<IMilestoneStep>) => {
      state.milestonestepMap[action.payload.id] = action.payload;
    },
    removeMilestoneStepFromMap: (state, action: PayloadAction<string>) => {
      delete state.milestonestepMap[action.payload];
    },
    updateMilestoneStepInMap: (
      state,
      action: PayloadAction<{ id: string; data: Partial<IMilestoneStep> }>,
    ) => {
      const { id, data } = action.payload;
      if (state.milestonestepMap[id]) {
        state.milestonestepMap[id] = {
          ...state.milestonestepMap[id],
          ...data,
        };
      }
    },
  },

  extraReducers: (builder) => {
    // GET ALL
    builder
      .addCase(fetchMilestoneSteps.pending, (state) => {
        state.loader = true;
        state.error = null;
      })
      .addCase(fetchMilestoneSteps.fulfilled, (state, action) => {
        state.loader = false;
        state.milestonestepMap = {};

        const sorted = action.payload.data.sort((a, b) =>
          a.name.localeCompare(b.name),
        );

        sorted.forEach((s) => {
          state.milestonestepMap[s.id] = s;
        });
      })
      .addCase(fetchMilestoneSteps.rejected, (state, action) => {
        state.loader = false;
        state.error = action.error.message || 'Failed to fetch steps';
      });

    // GET ONE
    builder.addCase(fetchMilestoneStepById.fulfilled, (state, action) => {
      state.milestonestepMap[action.payload.id] = action.payload;
    });

    // GET BY MILESTONE
    builder.addCase(fetchStepsByMilestoneId.fulfilled, (state, action) => {
      const { steps } = action.payload; // steps เป็น array แล้ว

      steps.forEach((s: IMilestoneStep) => {
        state.milestonestepMap[s.id] = s;
      });
    });

    // CREATE
    builder
      .addCase(createMilestoneStep.pending, (state) => {
        state.storeAction = 'creating';
      })
      .addCase(createMilestoneStep.fulfilled, (state, action) => {
        state.storeAction = 'none';
        state.milestonestepMap[action.payload.receivedData.id] =
          action.payload.receivedData;
      })
      .addCase(createMilestoneStep.rejected, (state, action) => {
        state.storeAction = 'none';
        state.error = action.error.message || 'Create step failed';
      });

    // UPDATE
    builder
      .addCase(updateMilestoneStep.pending, (state) => {
        state.storeAction = 'updating';
      })
      .addCase(updateMilestoneStep.fulfilled, (state, action) => {
        state.storeAction = 'none';

        const { id, data } = action.payload;
        if (state.milestonestepMap[id]) {
          state.milestonestepMap[id] = {
            ...state.milestonestepMap[id],
            ...data,
          };
        }
      });

    // DELETE SINGLE
    builder.addCase(deleteMilestoneStep.fulfilled, (state, action) => {
      delete state.milestonestepMap[action.payload];
    });

    // DELETE MULTIPLE
    builder.addCase(deleteMilestoneSteps.fulfilled, (state, action) => {
      action.payload.forEach((id) => {
        delete state.milestonestepMap[id];
      });
    });
  },
});

// --------------------------------------------------
// SELECTORS
// --------------------------------------------------
export const selectMilestoneStepMap = (state: RootState) =>
  state.milestonesteps.milestonestepMap;

export const selectStepsByMilestoneId = createSelector(
  [selectMilestoneStepMap, (_: RootState, milestoneId: string) => milestoneId],
  (map, milestoneId) =>
    Object.values(map)
      .filter((s) => s.milestoneId === milestoneId)
      .sort((a, b) => a.position - b.position),
);

export const selectMilestoneStepState = (state: RootState) =>
  state.milestonesteps;

// --------------------------------------------------
export const {
  addMilestoneStepToMap,
  removeMilestoneStepFromMap,
  updateMilestoneStepInMap,
} = milestoneStepSlice.actions;

export default milestoneStepSlice.reducer;
