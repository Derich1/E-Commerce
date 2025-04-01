// features/packagesSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Package {
  height: number;
  width: number;
  length: number;
  weight: number;
}

interface PackagesState {
  package: Package | null;
}

const initialState: PackagesState = {
  package: null
};

const packagesSlice = createSlice({
  name: 'packages',
  initialState,
  reducers: {
    setPackage: (state, action: PayloadAction<Package>) => {
      state.package = action.payload;
    },
    clearPackages: (state) => {
      state.package = null;
    }
  },
});

export const { setPackage, clearPackages } = packagesSlice.actions;
export default packagesSlice.reducer;

// Seletor para acessar os pacotes
export const selectPackages = (state: { packages: PackagesState }) => state.packages.package;