import { configureStore } from '@reduxjs/toolkit';
import studentReducer from './slices/student-slice.store';
import courseReducer from './course/course.slice';
import milestoneReducer from './milestone/milestone.slice';
import milestoneStepReducer from './milestone-step/milestone-step.slice';
import courseStaffReducer from './course-staff/course-staff.slice';
export const store = configureStore({
  reducer: {
    students: studentReducer,
    courses: courseReducer,
    milestones: milestoneReducer,
    milestoneSteps: milestoneStepReducer,
    courseStaffs: courseStaffReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
