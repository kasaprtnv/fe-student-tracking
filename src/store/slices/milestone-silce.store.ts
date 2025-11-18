import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  createSelector,
} from '@reduxjs/toolkit';
import {
  IMilestone,
  IMilestoneCreateDTO,
  MilestoneState,
} from '../../types/milestone';
import { milestoneService } from '@/services/milestone.service';
import { setSearchQuery } from './student-slice.store';
import { Loader, Milestone } from 'lucide-react';
import { RootState } from '..';
import { selectCourseMap } from './course-slice.store';

// --------------------------------------------------
// GET ALL MILESTONES
// --------------------------------------------------
export const fetchMilestones = createAsyncThunk(
  'milestones/fetchAll',
  async () => {
    const res = await milestoneService.getAllMilestone();
    return res;
  },
);

// --------------------------------------------------
// GET MILESTONES BY ID
// --------------------------------------------------
export const fetchMilestoneById = createAsyncThunk(
  'milestones/fetchById',
  async (id: string) => {
    const res = await milestoneService.getMilestoneById(id);
    return res;
  },
);

// --------------------------------------------------
// CREATE MILESTONE
// (คุณส่ง name/description/course_id/position ได้ตาม UI)
// --------------------------------------------------
export const addMilestone = createAsyncThunk(
  'milestones/add',
  async (data: IMilestoneCreateDTO) => {
    const res = await milestoneService.createMilestone(data);
    return res;
  },
);

// --------------------------------------------------
// UPDATE MILESTONE
// --------------------------------------------------
export const updateMilestone = createAsyncThunk(
  'milestones/update',
  async ({ id, data }: { id: string; data: Partial<IMilestone> }) => {
    const res = await milestoneService.updateMilestone(id, data);
    return { id, data: res.updatedFields };
  },
);

// --------------------------------------------------
// DELETE MILESTONE
// --------------------------------------------------
export const deleteMilestone = createAsyncThunk(
  'milestones/delete',
  async (id: string) => {
    await milestoneService.deleteMilestone(id);
    return id; // return id ที่ลบ
  },
);

// --------------------------------------------------
// DELETE MILESTONE MULTIPLE
// --------------------------------------------------
export const deleteMilestones = createAsyncThunk(
  'milestones/deleteMutiple',
  async (ids: string[]) => {
    await milestoneService.deleteMultipleMilestone(ids);
    return ids;
  },
);

const initialState: MilestoneState = {
  milestonemap: {},
  searchQuery: '',
  storeAction: 'none',
  loader: false,
  error: null,
};

// --------------------------------------------------
// SLICE
// --------------------------------------------------
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

    addMilestoneToMap: (state, action: PayloadAction<IMilestone>) => {
      state.milestonemap[action.payload.id] = action.payload;
    },
    removeMilestoneFromMap: (state, action: PayloadAction<string>) => {
      delete state.milestonemap[action.payload];
    },
    updateMilestoneInMap: (
      state,
      action: PayloadAction<{ id: string; data: Partial<IMilestone> }>,
    ) => {
      const { id, data } = action.payload;
      if (state.milestonemap[id]) {
        state.milestonemap[id] = { ...state.milestonemap[id], ...data };
      }
    },
  },
  extraReducers: (builder) => {
    // GET ALL
    builder
      .addCase(fetchMilestones.pending, (state) => {
        state.loader = true;
        state.error = null;
      })
      .addCase(fetchMilestones.fulfilled, (state, action) => {
        state.loader = false;
        state.milestonemap = {};
        const sortedMilestone = action.payload.data.sort((a, b) =>
          a.name.localeCompare(b.name),
        );
        sortedMilestone.forEach((milestone) => {
          state.milestonemap[milestone.id] = milestone;
        });
      })
      .addCase(fetchMilestones.rejected, (state, action) => {
        state.loader = false;
        state.error = action.error.message || 'Failed to fetch milestone';
      });

    // GET BY ID
    builder
      .addCase(fetchMilestoneById.pending, (state) => {
        state.loader = true;
        state.error = null;
      })
      .addCase(fetchMilestoneById.fulfilled, (state, action) => {
        state.loader = false;
        state.milestonemap[action.payload.id] = action.payload;
      })
      .addCase(fetchMilestoneById.rejected, (state, action) => {
        state.loader = false;
        state.error = action.error.message || 'Failed to fetch course';
      });

    // ADD
    builder
      .addCase(addMilestone.pending, (state) => {
        state.storeAction = 'creating';
        state.error = null;
      })
      .addCase(addMilestone.fulfilled, (state, action) => {
        state.storeAction = 'none';
        state.milestonemap[action.payload.receivedData.id] =
          action.payload.receivedData;
      })
      .addCase(addMilestone.rejected, (state, action) => {
        state.storeAction = 'none';
        state.error = action.error.message || 'Failed to create milestone';
      });

    // UPDATE
    builder
      .addCase(updateMilestone.pending, (state) => {
        state.storeAction = 'updating';
        state.error = null;
      })
      .addCase(updateMilestone.fulfilled, (state, action) => {
        state.storeAction = 'none';
        const { id, data } = action.payload;
        if (state.milestonemap[id]) {
          state.milestonemap[id] = { ...state.milestonemap[id], ...data };
        }
      })
      .addCase(updateMilestone.rejected, (state, action) => {
        state.storeAction = 'none';
        state.error = action.error.message || 'Failed to update milestone';
      });

    // DELETE
    builder
      .addCase(deleteMilestone.pending, (state) => {
        state.storeAction = 'deleting';
        state.error = null;
      })
      .addCase(deleteMilestone.fulfilled, (state, action) => {
        state.storeAction = 'none';
        delete state.milestonemap[action.payload];
      })
      .addCase(deleteMilestone.rejected, (state, action) => {
        state.storeAction = 'none';
        state.error = action.error.message || 'Failed to delete milestone';
      });
  },
});

export const selectMilestoneMap = (state: RootState) =>
  state.milestones.milestonemap;
export const selectSearchQuery = (state: RootState) =>
  state.milestones.searchQuery;
export const selectMilestoneState = (state: RootState) => state.milestones;

export const selectFilteredMilestoneId = createSelector(
  [selectMilestoneMap, selectSearchQuery],
  (milestonemap, searchQuery) => {
    const lowerSearchQuery = searchQuery.trim().toLowerCase();
    const milestones = Object.values(milestonemap);
    if (!lowerSearchQuery) {
      return milestones.map((milestone) => milestone.id);
    }
    const filtered = milestones.filter(
      (milestone) =>
        milestone.name?.toLowerCase().includes(lowerSearchQuery) ||
        milestone.description?.toLowerCase().includes(lowerSearchQuery) ||
        milestone.notifyReceiverEmail
          ?.toLowerCase()
          .includes(lowerSearchQuery) ||
        milestone.deadlineDate?.toLowerCase().includes(lowerSearchQuery),
    );
    return filtered.map((milestone) => milestone.id);
  },
);

export const selectAllMilestoneId = createSelector(
  [selectMilestoneMap],
  (milestonemap) => {
    const sortedMilestone = Object.values(milestonemap).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    return sortedMilestone.map((milestone) => milestone.id);
  },
);

export const {
  setSearchQuery: setMilestoneSearchQuery,
  clearError,
  addMilestoneToMap,
  removeMilestoneFromMap,
  updateMilestoneInMap,
} = milestoneSlice.actions;

export default milestoneSlice.reducer;
