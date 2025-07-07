import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PDS {
  id: string;
  userId: string;
  status: 'draft' | 'completed' | 'validated';
  personalInfo: any;
  familyBackground: any;
  educationalBackground: any[];
  civilService: any[];
  workExperience: any[];
  voluntaryWork: any[];
  trainingPrograms: any[];
  specialSkills: any[];
  recognition: any[];
  membership: any[];
  references: any[];
  questionsAnswers: any;
  fullData: any;
  createdAt: string;
  updatedAt: string;
}

interface PDSState {
  list: PDS[];
  current: PDS | null;
  loading: boolean;
  errors: Record<string, string>;
}

const initialState: PDSState = {
  list: [],
  current: null,
  loading: false,
  errors: {},
};

const pdsSlice = createSlice({
  name: 'pds',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setPDSList: (state, action: PayloadAction<PDS[]>) => {
      state.list = action.payload;
    },
    setCurrentPDS: (state, action: PayloadAction<PDS | null>) => {
      state.current = action.payload;
    },
    updatePDS: (state, action: PayloadAction<PDS>) => {
      const index = state.list.findIndex((pds) => pds.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
      if (state.current?.id === action.payload.id) {
        state.current = action.payload;
      }
    },
    addPDS: (state, action: PayloadAction<PDS>) => {
      state.list.push(action.payload);
    },
    removePDS: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((pds) => pds.id !== action.payload);
      if (state.current?.id === action.payload) {
        state.current = null;
      }
    },
    setErrors: (state, action: PayloadAction<Record<string, string>>) => {
      state.errors = action.payload;
    },
    clearErrors: (state) => {
      state.errors = {};
    },
  },
});

export const {
  setLoading,
  setPDSList,
  setCurrentPDS,
  updatePDS,
  addPDS,
  removePDS,
  setErrors,
  clearErrors,
} = pdsSlice.actions;

export default pdsSlice.reducer;
