import { configureStore } from '@reduxjs/toolkit';
import courseReducer from './course/course.slice';
import milestoneReducer from './milestone/milestone.slice';
import milestoneStepReducer from './milestone-step/milestone-step.slice';
import courseStaffReducer from './course-staff/course-staff.slice';
import MilestonePrerequisiteReducer from './milestone-prerequisite/milestone-prerequisite.slice';
import userReducer from './user/user.slice';
import authReducer from './auth/auth.slice';
import dashboardReducer from './dashboard/dashboard.slice';

export const store = configureStore({
  reducer: {
    courses: courseReducer,
    milestones: milestoneReducer,
    milestoneSteps: milestoneStepReducer,
    courseStaffs: courseStaffReducer,
    milestonePrerequisites: MilestonePrerequisiteReducer,
    users: userReducer,
    auth: authReducer,
    dashboard: dashboardReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
