import { milestoneStepService } from '@/services/milestone-step.service';
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  IMilestoneStep,
  IMilestoneStepCreateDTO,
} from '@/types/milestone-step';

export const fetchMilestoneSteps = createAsyncThunk(
  'milestoneStep/getList',
  async (_, { rejectWithValue }) => {
    try {
      const res = await milestoneStepService.getAllMilestoneSteps();
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to fetch milestone steps');
    }
  },
);

export const fetchMilestoneStepById = createAsyncThunk(
  'milestoneStep/getById',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await milestoneStepService.getMilestoneStepById(id);
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to fetch milestone step');
    }
  },
);

export const fetchMilestoneStepsByMilestoneId = createAsyncThunk(
  'milestoneStep/getByMilestoneId',
  async (milestoneId: string, { rejectWithValue }) => {
    try {
      const res =
        await milestoneStepService.getMilestoneStepsByMilestoneId(milestoneId);
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to fetch milestone steps by milestone ID');
    }
  },
);

export const createMilestoneStep = createAsyncThunk(
  'milestoneStep/create',
  async (payload: IMilestoneStepCreateDTO, { rejectWithValue }) => {
    try {
      const res = await milestoneStepService.createMilestoneStep(payload);
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to create milestone step');
    }
  },
);

export const updateMilestoneStep = createAsyncThunk(
  'milestoneStep/update',
  async (
    { id, data }: { id: string; data: Partial<IMilestoneStep> },
    { rejectWithValue },
  ) => {
    try {
      const res = await milestoneStepService.updateMilestoneStep(id, data);
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to update milestone step');
    }
  },
);

export const deleteMilestoneStep = createAsyncThunk(
  'milestoneStep/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await milestoneStepService.deleteMilestoneStep(id);
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to delete milestone step');
    }
  },
);
