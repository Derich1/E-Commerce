// features/packagesSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Package {
  height: number;
  width: number;
  length: number;
  weight: number;
}

interface PackagesState {
  packages: Package[];
}

const initialState: PackagesState = {
  packages: [],
};

const packagesSlice = createSlice({
  name: 'packages',
  initialState,
  reducers: {
    setPackages: (state, action: PayloadAction<Package[]>) => {
      state.packages = action.payload;
    },
    clearPackages: (state) => {
      state.packages = [];
    }
  },
});

export const { setPackages, clearPackages } = packagesSlice.actions;
export default packagesSlice.reducer;

// Seletor para acessar os pacotes
export const selectPackages = (state: { packages: PackagesState }) => state.packages.packages;