import {
  StudentStepAttempts,
  StudentStepAttemptsState,
} from '@/types/student-step-attempts';
import { createSlice } from '@reduxjs/toolkit';
import { getAttemptsByUserId } from './student-step-attempts.thunks';

const initialState: StudentStepAttemptsState = {
  studentStepAttemptsMap: {},
  loader: false,
  error: null,
};

const studentStepAttemptsSlice = createSlice({
  name: 'studentStepAttempts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch attempts by user ID
    builder
      .addCase(getAttemptsByUserId.pending, (state) => {
        state.loader = true;
        state.error = null;
      })
      .addCase(getAttemptsByUserId.fulfilled, (state, action) => {
        state.loader = false;
        state.studentStepAttemptsMap = {};
        action.payload.data.forEach((attempt: StudentStepAttempts) => {
          state.studentStepAttemptsMap[attempt.id] = attempt;
        });
      })
      .addCase(getAttemptsByUserId.rejected, (state, action) => {
        state.loader = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = studentStepAttemptsSlice.actions;

export default studentStepAttemptsSlice.reducer;
