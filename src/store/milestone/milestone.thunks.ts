import { milestoneService } from '@/services/milestone.service';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { IMilestone, IMilestoneCreateDTO } from '@/types/milestone';

export const fetchMilestones = createAsyncThunk(
  'milestones/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await milestoneService.getAllMilestone();
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to fetch milestones');
    }
  },
);

export const fetchMilestoneById = createAsyncThunk(
  'milestones/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await milestoneService.getMilestoneById(id);
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to fetch milestone');
    }
  },
);

export const fetchMilestonesWithStatusByCourseId = createAsyncThunk(
  'milestones/fetchWithStatusByCourseId',
  async (
    { courseId, userId }: { courseId: string; userId: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await milestoneService.getMilestonesWithStatusByCourseId(
        courseId,
        userId,
      );
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to fetch milestones with status');
    }
  },
);

export const addMilestone = createAsyncThunk(
  'milestones/add',
  async (data: IMilestoneCreateDTO, { rejectWithValue }) => {
    try {
      const res = await milestoneService.createMilestone(data);
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to create milestone');
    }
  },
);

export const updateMilestone = createAsyncThunk(
  'milestones/update',
  async (
    { id, data }: { id: string; data: Partial<IMilestone> },
    { rejectWithValue },
  ) => {
    try {
      const res = await milestoneService.updateMilestone(id, data);
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to update milestone');
    }
  },
);

export const deleteMilestone = createAsyncThunk(
  'milestones/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await milestoneService.deleteMilestone(id);
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to delete milestone');
    }
  },
);

export const deleteMilestones = createAsyncThunk(
  'milestones/deleteMultiple',
  async (ids: string[], { rejectWithValue }) => {
    try {
      const res = await milestoneService.deleteMultipleMilestone(ids);
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to delete multiple milestones');
    }
  },
);
