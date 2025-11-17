import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  createSelector,
} from '@reduxjs/toolkit';
import { Student, StudentState } from '@/types/student';
import { studentService } from '@/services/student.service';
import { RootState } from '@/store';

// Async thunks
export const fetchStudents = createAsyncThunk('students/fetchAll', async () => {
  const response = await studentService.getAll();
  return response.data;
});

export const fetchStudentById = createAsyncThunk(
  'students/fetchById',
  async (id: string) => {
    const response = await studentService.getById(id);
    return response;
  },
);

export const fetchStudentOptions = createAsyncThunk(
  'students/fetchOptions',
  async () => {
    const response = await studentService.getOptions();
    return response.data;
  },
);

export const createStudent = createAsyncThunk(
  'students/create',
  async (studentData: Omit<Student, 'id'>) => {
    const response = await studentService.create(studentData);
    return response;
  },
);

export const updateStudent = createAsyncThunk(
  'students/update',
  async ({ id, data }: { id: string; data: Partial<Student> }) => {
    const response = await studentService.update(id, data);
    return { id, data: response.updatedFields };
  },
);

export const deleteStudent = createAsyncThunk(
  'students/delete',
  async (id: string) => {
    await studentService.deleteById(id); // แก้ไขเป็น deleteById
    return id;
  },
);

export const deleteStudents = createAsyncThunk(
  'students/deleteMultiple',
  async (ids: string[]) => {
    await studentService.deleteMultiple(ids);
    return ids;
  },
);

const initialState: StudentState = {
  studentMap: {},
  searchQuery: '',
  storeAction: 'none',
  loader: false,
  error: null,
};

const studentSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    // UI Actions
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },

    // Manual Cache Management
    addToCache: (state, action: PayloadAction<Student>) => {
      state.studentMap[action.payload.id] = action.payload;
    },
    removeFromCache: (state, action: PayloadAction<string>) => {
      delete state.studentMap[action.payload];
    },
    updateCache: (
      state,
      action: PayloadAction<{ id: string; data: Partial<Student> }>,
    ) => {
      const { id, data } = action.payload;
      if (state.studentMap[id]) {
        state.studentMap[id] = { ...state.studentMap[id], ...data };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Students
      .addCase(fetchStudents.pending, (state) => {
        state.loader = true;
        state.error = null;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.loader = false;
        // Sort by firstName
        const sortedStudents = action.payload.sort((a, b) =>
          a.firstName.localeCompare(b.firstName),
        );

        // Clear existing map and rebuild
        state.studentMap = {};
        sortedStudents.forEach((student) => {
          state.studentMap[student.id] = student;
        });
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.loader = false;
        state.error = action.error.message || 'Failed to fetch students';
        console.error('Fetch students error:', action.error); // เพิ่ม debug log
      })

      // Fetch by ID
      .addCase(fetchStudentById.pending, (state) => {
        state.loader = true;
        state.error = null;
      })
      .addCase(fetchStudentById.fulfilled, (state, action) => {
        state.loader = false;
        state.studentMap[action.payload.id] = action.payload;
      })
      .addCase(fetchStudentById.rejected, (state, action) => {
        state.loader = false;
        state.error = action.error.message || 'Failed to fetch student';
      })

      // Fetch Options
      .addCase(fetchStudentOptions.pending, (state) => {
        state.loader = true;
      })
      .addCase(fetchStudentOptions.fulfilled, (state) => {
        state.loader = false;
      })
      .addCase(fetchStudentOptions.rejected, (state, action) => {
        state.loader = false;
        state.error = action.error.message || 'Failed to fetch student options';
      })

      // Create
      .addCase(createStudent.pending, (state) => {
        state.storeAction = 'creating';
        state.error = null;
      })
      .addCase(createStudent.fulfilled, (state, action) => {
        state.storeAction = 'none';
        state.studentMap[action.payload.receivedData.id] =
          action.payload.receivedData;
      })
      .addCase(createStudent.rejected, (state, action) => {
        state.storeAction = 'none';
        state.error = action.error.message || 'Failed to create student';
      })

      // Update
      .addCase(updateStudent.pending, (state) => {
        state.storeAction = 'updating';
        state.error = null;
      })
      .addCase(updateStudent.fulfilled, (state, action) => {
        state.storeAction = 'none';
        const { id, data } = action.payload;
        if (state.studentMap[id]) {
          state.studentMap[id] = { ...state.studentMap[id], ...data };
        }
      })
      .addCase(updateStudent.rejected, (state, action) => {
        state.storeAction = 'none';
        state.error = action.error.message || 'Failed to update student';
      })

      // Delete
      .addCase(deleteStudent.pending, (state) => {
        state.storeAction = 'deleting';
        state.error = null;
      })
      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.storeAction = 'none';
        delete state.studentMap[action.payload];
      })
      .addCase(deleteStudent.rejected, (state, action) => {
        state.storeAction = 'none';
        state.error = action.error.message || 'Failed to delete student';
      })

      // Delete Multiple
      .addCase(deleteStudents.pending, (state) => {
        state.storeAction = 'deleting';
        state.error = null;
      })
      .addCase(deleteStudents.fulfilled, (state, action) => {
        state.storeAction = 'none';
        action.payload.forEach((id) => {
          delete state.studentMap[id];
        });
      })
      .addCase(deleteStudents.rejected, (state, action) => {
        state.storeAction = 'none';
        state.error = action.error.message || 'Failed to delete students';
      });
  },
});

// Selectors (คล้าย computed ใน MobX)
export const selectStudentMap = (state: RootState) => state.students.studentMap;
export const selectSearchQuery = (state: RootState) =>
  state.students.searchQuery;
export const selectStudentState = (state: RootState) => state.students;

// Filtered Students
export const selectFilteredStudentIds = createSelector(
  [selectStudentMap, selectSearchQuery],
  (studentMap, searchQuery) => {
    const students = Object.values(studentMap);
    const query = searchQuery.trim().toLowerCase();

    if (!query) return students.map((s) => s.id);

    const filteredStudents = students.filter((student) => {
      return (
        student.firstName?.toLowerCase().includes(query) ||
        student.lastName?.toLowerCase().includes(query) ||
        student.code?.toString().includes(query) ||
        student.createdAt?.toLowerCase().includes(query) ||
        student.updatedAt?.toLowerCase().includes(query)
      );
    });

    return filteredStudents.map((s) => s.id);
  },
);

// All Student IDs
export const selectAllStudentIds = createSelector(
  [selectStudentMap],
  (studentMap) => Object.keys(studentMap),
);

export const {
  setSearchQuery,
  clearError,
  addToCache,
  removeFromCache,
  updateCache,
} = studentSlice.actions;

export default studentSlice.reducer;
