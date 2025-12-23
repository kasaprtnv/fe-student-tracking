import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  IMilestonePrerequisite,
  MilestonePrerequisiteDTO,
} from '@/types/milestone-prerequisite';
import { milestonePrerequisiteService } from '@/services/milestone-prerequisite.service';
import { UUID } from 'crypto';

// GET ALL
export const fetchAllPrerequisites = createAsyncThunk(
  'prerequisite/getList',
  async (_, { rejectWithValue }) => {
    try {
      const res = await milestonePrerequisiteService.getAll();
      if (Array.isArray(res)) {
        return { data: res, pageCount: res.length || 0 };
      }
      return res;
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error ? err.message : 'Failed to fetch prerequisites',
      );
    }
  },
);

// GET BY ID
export const fetchPrerequisiteByCourseId = createAsyncThunk(
  'prerequisite/getByCourseId',
  async (courseId: UUID, { rejectWithValue }) => {
    try {
      const res = await milestonePrerequisiteService.getById(courseId);
      return res;
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error ? err.message : 'Failed to fetch prerequisite',
      );
    }
  },
);

// CREATE ONE
export const createPrerequisite = createAsyncThunk(
  'prerequisite/create',
  async (data: Partial<IMilestonePrerequisite>, { rejectWithValue }) => {
    try {
      const res = await milestonePrerequisiteService.create(data);
      return res;
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error ? err.message : 'Failed to create prerequisite',
      );
    }
  },
);

// CREATE MANY
export const createManyPrerequisites = createAsyncThunk(
  'prerequisite/createMany',
  async (items: MilestonePrerequisiteDTO[], { rejectWithValue }) => {
    try {
      const res = await milestonePrerequisiteService.createMany(items);
      return res;
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error ? err.message : 'Failed to create prerequisites',
      );
    }
  },
);

// UPDATE
export const updatePrerequisite = createAsyncThunk(
  'prerequisite/update',
  async (
    {
      courseId,
      data,
    }: {
      courseId: string;
      data: MilestonePrerequisiteDTO[];
    },
    { rejectWithValue },
  ) => {
    try {
      const res = await milestonePrerequisiteService.update(courseId, data);
      return res;
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error ? err.message : 'Failed to update prerequisite',
      );
    }
  },
);

// DELETE
export const deletePrerequisite = createAsyncThunk(
  'prerequisite/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await milestonePrerequisiteService.deletePrerequisite(id);
      return res;
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error ? err.message : 'Failed to delete prerequisite',
      );
    }
  },
);
