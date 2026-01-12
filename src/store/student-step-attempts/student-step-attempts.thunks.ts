import { studentStepProgressService } from '@/services/student-step-progress.service';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const getAttemptsByUserId = createAsyncThunk(
  'studentStepAttempts/getByUserId',
  async (userId: string, { rejectWithValue }) => {
    try {
      const res = await studentStepProgressService.getAttemptsByUserId(userId);
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to fetch student step attempts');
    }
  },
);
