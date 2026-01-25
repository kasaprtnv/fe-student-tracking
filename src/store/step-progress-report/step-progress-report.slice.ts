import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchStepProgressReport } from './step-progress-report.thunks';
import {
  IStepProgressReport,
  StepProgressReportState,
} from '@/types/step-progress-report';

const initialState: StepProgressReportState = {
  stepProgressReportMap: {},
  searchQuery: '',
  loader: false,
};

const stepProgressSlice = createSlice({
  name: 'stepProgressReport',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch by Filter
    builder
      .addCase(fetchStepProgressReport.pending, (state) => {
        state.loader = true;
      })
      .addCase(fetchStepProgressReport.fulfilled, (state, action) => {
        state.loader = false;
        state.stepProgressReportMap = {};
        action.payload.data.forEach((report: IStepProgressReport) => {
          state.stepProgressReportMap[report.progressId] = report;
        });
      })
      .addCase(fetchStepProgressReport.rejected, (state) => {
        state.loader = false;
      });
  },
});

export const { setSearchQuery } = stepProgressSlice.actions;
export default stepProgressSlice.reducer;
