import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  fetchCourseStaff,
  fetchCourseStaffById,
  fetchCourseStaffByCourseId,
  createCourseStaff,
  updateCourseStaff,
  deleteCourseStaff,
} from './course-staff.thunk';
import { ICourseStaff, CourseStaffState } from '@/types/course-staff';

const initialState: CourseStaffState = {
  courseStaffMap: {},
  searchQuery: '',
  storeAction: 'none',
  loader: false,
  error: null,
};

const courseStaffSlice = createSlice({
  name: 'courseStaff',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all course staff
    builder
      .addCase(fetchCourseStaff.pending, (state) => {
        state.loader = true;
        state.error = null;
      })
      .addCase(fetchCourseStaff.fulfilled, (state, action) => {
        state.loader = false;
        state.courseStaffMap = {};
        action.payload.data.forEach((courseStaff: ICourseStaff) => {
          state.courseStaffMap[courseStaff.id] = courseStaff;
        });
      })
      .addCase(fetchCourseStaff.rejected, (state, action) => {
        state.loader = false;
        state.error = action.payload as string;
      });

    // Fetch course staff by ID
    builder
      .addCase(fetchCourseStaffById.pending, (state) => {
        state.loader = true;
        state.error = null;
      })
      .addCase(fetchCourseStaffById.fulfilled, (state, action) => {
        state.loader = false;
        state.courseStaffMap[action.payload.id] = action.payload;
      })
      .addCase(fetchCourseStaffById.rejected, (state, action) => {
        state.loader = false;
        state.error = action.payload as string;
      });

    // Fetch course staff by Course ID
    builder
      .addCase(fetchCourseStaffByCourseId.pending, (state) => {
        state.loader = true;
        state.error = null;
      })
      .addCase(fetchCourseStaffByCourseId.fulfilled, (state, action) => {
        state.loader = false;
        action.payload.data.forEach((courseStaff: ICourseStaff) => {
          state.courseStaffMap[courseStaff.id] = courseStaff;
        });
      })
      .addCase(fetchCourseStaffByCourseId.rejected, (state, action) => {
        state.loader = false;
        state.error = action.payload as string;
      });

    // Create course staff
    builder
      .addCase(createCourseStaff.pending, (state) => {
        state.storeAction = 'creating';
        state.error = null;
      })
      .addCase(createCourseStaff.fulfilled, (state, action) => {
        state.storeAction = 'none';
        state.courseStaffMap[action.payload.receivedData.id] =
          action.payload.receivedData;
      })
      .addCase(createCourseStaff.rejected, (state, action) => {
        state.storeAction = 'none';
        state.error = action.payload as string;
      });

    // Update course staff
    builder
      .addCase(updateCourseStaff.pending, (state) => {
        state.storeAction = 'updating';
        state.error = null;
      })
      .addCase(updateCourseStaff.fulfilled, (state, action) => {
        state.storeAction = 'none';
        const updatedData = action.payload.updatedFields;
        if (updatedData.id && state.courseStaffMap[updatedData.id])
          state.courseStaffMap[updatedData.id] = {
            ...state.courseStaffMap[updatedData.id],
            ...updatedData,
          };
      })
      .addCase(updateCourseStaff.rejected, (state, action) => {
        state.storeAction = 'none';
        state.error = action.payload as string;
      });

    // Delete course staff
    builder
      .addCase(deleteCourseStaff.pending, (state) => {
        state.storeAction = 'deleting';
        state.error = null;
      })
      .addCase(deleteCourseStaff.fulfilled, (state, action) => {
        state.storeAction = 'none';
        const deletedId = action.payload.deletedId;
        delete state.courseStaffMap[deletedId];
      })
      .addCase(deleteCourseStaff.rejected, (state, action) => {
        state.storeAction = 'none';
        state.error = action.payload as string;
      });
  },
});

export const { setSearchQuery, clearError } = courseStaffSlice.actions;
export default courseStaffSlice.reducer;
