import { milestoneService } from '@/services/milestone.service';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { IMilestone, IMilestoneCreateDTO } from '@/types/milestone';

export const fetchMilestones = createAsyncThunk(
  'milestones/fetchAll',
  async (
    {
      page,
      pageSize,
      sortBy,
      sortOrder,
    }: {
      page?: number;
      pageSize?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
    { rejectWithValue },
  ) => {
    try {
      const res = await milestoneService.getAllMilestone(
        page,
        pageSize,
        sortBy,
        sortOrder,
      );
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to fetch milestones');
    }
  },
);

export const searchMilestones = createAsyncThunk(
  'milestones/search',
  async (
    {
      searchQuery,
      page,
      pageSize,
      sortBy,
      sortOrder,
    }: {
      searchQuery: string;
      page: number;
      pageSize: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
    { rejectWithValue },
  ) => {
    try {
      const res = await milestoneService.searchMilestones(
        searchQuery,
        page,
        pageSize,
        sortBy,
        sortOrder,
      );
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to search milestones');
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

export const fetchMilestonesByCourseId = createAsyncThunk(
  'milestones/fetchByCourseId',
  async (courseId: string, { rejectWithValue }) => {
    try {
      const res = await milestoneService.getMilestonesByCourseId(courseId);
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to fetch milestones by course');
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

export const reorderMilestones = createAsyncThunk(
  'milestones/reorder',
  async (
    payload: { id: string; position: number; courseId: string }[],
    { rejectWithValue },
  ) => {
    try {
      const res = await milestoneService.reorderMilestones(payload);
      return { payload, res }; // ส่งทั้ง position ใหม่ + res
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to reorder milestones');
    }
  },
);

export const fetchMilestonesByCourseIdWithPosition = createAsyncThunk(
  'milestones/fetchByCourseIdWithPosition',
  async (courseId: string, { rejectWithValue }) => {
    try {
      const res =
        await milestoneService.getMilestonesByCourseIdWithPosition(courseId);

      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue(
        'Failed to fetch milestones by course with position',
      );
    }
  },
);

export const removeCourseMilestone = createAsyncThunk(
  'milestones/removeCourseMilestone',
  async (
    { courseId, milestoneId }: { courseId: string; milestoneId: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await milestoneService.removeCourseMilestone(
        courseId,
        milestoneId,
      );

      return { courseId, milestoneId, success: res.success };
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }

      if (typeof err === 'string') {
        return rejectWithValue(err);
      }

      return rejectWithValue('Remove course milestone failed');
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
