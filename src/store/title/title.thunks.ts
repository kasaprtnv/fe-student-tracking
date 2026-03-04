import { titleService } from '@/services/title.service';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { ITitle, ITitleCreateDTO } from '@/types/title';

export const fetchTitles = createAsyncThunk(
  'title/getList',
  async (_, { rejectWithValue }) => {
    try {
      const res = await titleService.getAllTitles();
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to fetch titles');
    }
  },
);

export const fetchTitleById = createAsyncThunk(
  'title/getById',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await titleService.getTitleById(id);
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to fetch title');
    }
  },
);

export const createTitle = createAsyncThunk(
  'title/create',
  async (payload: ITitleCreateDTO, { rejectWithValue }) => {
    try {
      const res = await titleService.createTitle(payload);
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to create title');
    }
  },
);

export const updateTitle = createAsyncThunk(
  'title/update',
  async (
    { id, data }: { id: string; data: Partial<ITitle> },
    { rejectWithValue },
  ) => {
    try {
      const res = await titleService.updateTitle(id, data);
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to update title');
    }
  },
);

export const deleteTitle = createAsyncThunk(
  'title/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await titleService.deleteTitle(id);
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to delete title');
    }
  },
);

export const fetchAllTitlesUsage = createAsyncThunk(
  'title/fetchAllUsage',
  async (titleIds: string[]) => {
    try {
      const res = await titleService.getAllTitlesUsage(titleIds);
      return res;
    } catch {
      // Return empty object if API doesn't exist
      return {};
    }
  },
);
