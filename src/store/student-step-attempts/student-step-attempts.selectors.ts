import { RootState } from '..';

export const selectStepAttemptsState = (state: RootState) =>
  state.studentStepAttempts;

export const selectStepAttemptsMap = (state: RootState) =>
  state.studentStepAttempts.studentStepAttemptsMap;
