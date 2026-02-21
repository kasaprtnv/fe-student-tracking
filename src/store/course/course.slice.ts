import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  fetchCourses,
  searchCourses,
  fetchCourseById,
  createCourse,
  createCourseWithStaff,
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
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  },
};

const degreeTHMap = {
  master: 'ปริญญาโท',
  doctorate: 'ปริญญาเอก',
} as Record<string, string>;

const degreeENMap = {
  master: "Master's Degree",
  doctorate: 'Doctoral Degree',
} as Record<string, string>;

const getdegreeMap = (degree: string) => {
  return {
    degreeTH: degreeTHMap[degree] || '',
    degreeEN: degreeENMap[degree] || '',
  };
};

const courseSlice = createSlice({
  name: 'course',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setPaginationPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    setPaginationPageSize: (state, action: PayloadAction<number>) => {
      state.pagination.pageSize = action.payload;
      state.pagination.page = 1; // Reset to first page when page size changes
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
          const { degreeTH, degreeEN } = getdegreeMap(course.degree);
          state.courseMap[course.id] = { ...course, degreeTH, degreeEN };
        });
        if (action.payload.pagination) {
          state.pagination.total = action.payload.pagination?.total || 0;
          state.pagination.totalPages =
            action.payload.pagination?.totalPages || 0;
        }
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loader = false;
        state.error = action.payload as string;
      });

    // Search courses
    builder
      .addCase(searchCourses.pending, (state) => {
        state.loader = true;
        state.error = null;
      })
      .addCase(searchCourses.fulfilled, (state, action) => {
        state.loader = false;
        state.courseMap = {};
        action.payload.data.forEach((course: ICourse) => {
          const { degreeTH, degreeEN } = getdegreeMap(course.degree);
          state.courseMap[course.id] = { ...course, degreeTH, degreeEN };
        });
        console.log('Search results:', state.courseMap);
        if (action.payload.pagination) {
          state.pagination.total = action.payload.pagination?.total || 0;
          state.pagination.totalPages =
            action.payload.pagination?.totalPages || 0;
        }
      })
      .addCase(searchCourses.rejected, (state, action) => {
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
        const { degreeTH, degreeEN } = getdegreeMap(action.payload.degree);
        state.courseMap[action.payload.id] = {
          ...action.payload,
          degreeTH,
          degreeEN,
        };
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
        const { degreeTH, degreeEN } = getdegreeMap(
          action.payload.receivedData.degree,
        );
        state.courseMap[action.payload.receivedData.id] = {
          ...action.payload.receivedData,
          degreeTH,
          degreeEN,
        };
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.storeAction = 'none';
        state.error = action.payload as string;
      });

    // Create course with staff
    builder
      .addCase(createCourseWithStaff.pending, (state) => {
        state.storeAction = 'creating';
        state.error = null;
      })
      .addCase(createCourseWithStaff.fulfilled, (state, action) => {
        state.storeAction = 'none';
        const { degreeTH, degreeEN } = getdegreeMap(
          action.payload.receivedData.degree,
        );
        state.courseMap[action.payload.receivedData.id] = {
          ...action.payload.receivedData,
          degreeTH,
          degreeEN,
        };
      })
      .addCase(createCourseWithStaff.rejected, (state, action) => {
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
          const { degreeTH, degreeEN } = getdegreeMap(updated.degree as string);
          state.courseMap[updated.id] = {
            ...state.courseMap[updated.id],
            ...updated,
            degreeTH,
            degreeEN,
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
        delete state.courseMap[action.payload.deletedId];
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
        action.payload.deletedIds.forEach((id: string) => {
          delete state.courseMap[id];
        });
      })
      .addCase(deleteCourses.rejected, (state, action) => {
        state.storeAction = 'none';
        state.error = action.payload as string;
      });
  },
});

export const {
  setSearchQuery,
  clearError,
  setPaginationPage,
  setPaginationPageSize,
} = courseSlice.actions;
export default courseSlice.reducer;
