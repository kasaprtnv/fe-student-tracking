import { configureStore } from '@reduxjs/toolkit';
import studentReducer from './slices/student-slice.store';
import courseReducer from './slices/course-slice.store';

export const store = configureStore({
  reducer: {
    students: studentReducer,
    courses: courseReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
