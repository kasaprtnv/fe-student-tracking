import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  fetchCourses,
  fetchCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  deleteCourses,
} from './course.thunks';
import { ICourse, CourseState } from '@/types/course';

const initialState: CourseState = {
  courseMap: {},
  searchQuery: '',
  storeAction: 'none',
  loader: false,
  error: null,
};

const courseSlice = createSlice({
  name: 'course',
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
    // Fetch all courses
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.loader = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loader = false;
        state.courseMap = {};
        action.payload.data.forEach((course: ICourse) => {
          state.courseMap[course.id] = course;
        });
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loader = false;
        state.error = action.payload as string;
      });

    // Fetch course by ID
    builder
      .addCase(fetchCourseById.pending, (state) => {
        state.loader = true;
        state.error = null;
      })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.loader = false;
        state.courseMap[action.payload.id] = action.payload;
      })
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.loader = false;
        state.error = action.payload as string;
      });

    // Create course
    builder
      .addCase(createCourse.pending, (state) => {
        state.storeAction = 'creating';
        state.error = null;
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.storeAction = 'none';
        state.courseMap[action.payload.receivedData.id] =
          action.payload.receivedData;
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.storeAction = 'none';
        state.error = action.payload as string;
      });

    // Update course
    builder
      .addCase(updateCourse.pending, (state) => {
        state.storeAction = 'updating';
        state.error = null;
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        state.storeAction = 'none';
        const updated = action.payload.updatedFields;
        if (updated.id && state.courseMap[updated.id]) {
          state.courseMap[updated.id] = {
            ...state.courseMap[updated.id],
            ...updated,
          };
        }
      })
      .addCase(updateCourse.rejected, (state, action) => {
        state.storeAction = 'none';
        state.error = action.payload as string;
      });

    // Delete course
    builder
      .addCase(deleteCourse.pending, (state) => {
        state.storeAction = 'deleting';
        state.error = null;
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.storeAction = 'none';
        delete state.courseMap[action.meta.arg];
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.storeAction = 'none';
        state.error = action.payload as string;
      });

    // Delete multiple courses
    builder
      .addCase(deleteCourses.pending, (state) => {
        state.storeAction = 'deleting';
        state.error = null;
      })
      .addCase(deleteCourses.fulfilled, (state, action) => {
        state.storeAction = 'none';
        action.meta.arg.forEach((id: string) => {
          delete state.courseMap[id];
        });
      })
      .addCase(deleteCourses.rejected, (state, action) => {
        state.storeAction = 'none';
        state.error = action.payload as string;
      });
  },
});

export const { setSearchQuery, clearError } = courseSlice.actions;
export default courseSlice.reducer;
