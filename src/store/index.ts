import { configureStore } from '@reduxjs/toolkit';
import studentReducer from './slices/student-slice.store';
import courseReducer from './course/course.slice';
import milestoneReducer from './milestone/milestone.slice';
import milestoneStepReducer from './milestone-step/milestone-step.slice';
import userReducer from './user/user.slice';
import authReducer from './auth/auth.slice';

export const store = configureStore({
  reducer: {
    students: studentReducer,
    courses: courseReducer,
    milestones: milestoneReducer,
    milestoneSteps: milestoneStepReducer,
    users: userReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
