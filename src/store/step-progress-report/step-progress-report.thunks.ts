import { stepProgressReportService } from '@/services/step-progress-report.service';
import { IStepProgressReportFilter } from '@/types/step-progress-report';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchStepProgressReport = createAsyncThunk(
  'stepProgressReport/getByFilter',
  async (filter: IStepProgressReportFilter, { rejectWithValue }) => {
    try {
      const res = await stepProgressReportService.getStepProgressReport(filter);
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to fetch step progress report');
    }
  },
);
