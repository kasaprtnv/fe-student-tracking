import { courseService } from '@/services/course.service';
import { RootState } from '@/store';
import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  createSelector,
} from '@reduxjs/toolkit';
import { ICourse, CourseState, ICourseCreateDTO } from '@/types/course';

// Async thunks
export const fetchCourses = createAsyncThunk('courses/fetchAll', async () => {
  const response = await courseService.getAllCourses();
  return response.data;
});

export const fetchCourseById = createAsyncThunk(
  'courses/fetchById',
  async (id: string) => {
    const response = await courseService.getCourseById(id);
    return response;
  },
);

export const createCourse = createAsyncThunk(
  'courses/create',
  async (courseData: ICourseCreateDTO) => {
    const response = await courseService.createCourse(courseData);
    return response;
  },
);

export const updateCourse = createAsyncThunk(
  'courses/update',
  async ({ id, data }: { id: string; data: Partial<ICourse> }) => {
    const response = await courseService.updateCourse(id, data);
    return { id, data: response.updatedFields };
  },
);

export const deleteCourse = createAsyncThunk(
  'courses/delete',
  async (id: string) => {
    await courseService.deleteCourse(id);
    return id;
  },
);

export const deleteCourses = createAsyncThunk(
  'courses/deleteMultiple',
  async (ids: string[]) => {
    await courseService.deleteMultipleCourses(ids);
    return ids;
  },
);

const initialState: CourseState = {
  courseMap: {},
  searchQuery: '',
  storeAction: 'none',
  loader: false,
  error: null,
};

const courseSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },

    addCourseToMap: (state, action: PayloadAction<ICourse>) => {
      state.courseMap[action.payload.id] = action.payload;
    },
    removeCourseFromMap: (state, action: PayloadAction<string>) => {
      delete state.courseMap[action.payload];
    },
    updateCourseInMap: (
      state,
      action: PayloadAction<{ id: string; data: Partial<ICourse> }>,
    ) => {
      const { id, data } = action.payload;
      if (state.courseMap[id]) {
        state.courseMap[id] = { ...state.courseMap[id], ...data };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Courses
      .addCase(fetchCourses.pending, (state) => {
        state.loader = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loader = false;
        state.courseMap = {};
        const sortedCourses = action.payload.sort((a, b) =>
          a.name.localeCompare(b.name),
        );
        sortedCourses.forEach((course) => {
          state.courseMap[course.id] = course;
        });
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loader = false;
        state.error = action.error.message || 'Failed to fetch courses';
      });

    // Fetch Course By ID
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
        state.error = action.error.message || 'Failed to fetch course';
      });

    // Create Course
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
        state.error = action.error.message || 'Failed to create course';
      });

    // Update Course
    builder
      .addCase(updateCourse.pending, (state) => {
        state.storeAction = 'updating';
        state.error = null;
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        state.storeAction = 'none';
        const { id, data } = action.payload;
        if (state.courseMap[id]) {
          state.courseMap[id] = { ...state.courseMap[id], ...data };
        }
      })
      .addCase(updateCourse.rejected, (state, action) => {
        state.storeAction = 'none';
        state.error = action.error.message || 'Failed to update course';
      });

    // Delete Course
    builder
      .addCase(deleteCourse.pending, (state) => {
        state.storeAction = 'deleting';
        state.error = null;
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.storeAction = 'none';
        delete state.courseMap[action.payload];
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.storeAction = 'none';
        state.error = action.error.message || 'Failed to delete course';
      });

    // Delete Multiple Courses
    builder
      .addCase(deleteCourses.pending, (state) => {
        state.storeAction = 'deleting';
        state.error = null;
      })
      .addCase(deleteCourses.fulfilled, (state, action) => {
        state.storeAction = 'none';
        action.payload.forEach((id) => {
          delete state.courseMap[id];
        });
      })
      .addCase(deleteCourses.rejected, (state, action) => {
        state.storeAction = 'none';
        state.error = action.error.message || 'Failed to delete courses';
      });
  },
});

export const selectCourseMap = (state: RootState) => state.courses.courseMap;
export const selectSearchQuery = (state: RootState) =>
  state.courses.searchQuery;
export const selectCourseState = (state: RootState) => state.courses;

export const selectFilteredCoursesId = createSelector(
  [selectCourseMap, selectSearchQuery],
  (courseMap, searchQuery) => {
    const lowerSearchQuery = searchQuery.trim().toLowerCase();
    const courses = Object.values(courseMap);
    if (!lowerSearchQuery) {
      return courses.map((course) => course.id);
    }
    const filtered = courses.filter(
      (course) =>
        course.name?.toLowerCase().includes(lowerSearchQuery) ||
        course.code?.toLowerCase().includes(lowerSearchQuery) ||
        course.description?.toLowerCase().includes(lowerSearchQuery),
    );
    return filtered.map((course) => course.id);
  },
);

export const selectAllCourseId = createSelector(
  [selectCourseMap],
  (courseMap) => {
    const sortedCourses = Object.values(courseMap).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    return sortedCourses.map((course) => course.id);
  },
);

export const {
  setSearchQuery: setCourseSearchQuery,
  clearError,
  addCourseToMap,
  removeCourseFromMap,
  updateCourseInMap,
} = courseSlice.actions;

export default courseSlice.reducer;
