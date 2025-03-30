import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Frete {
  id: number;
  name: string;
  price?: string;
  custom_price?: string;
  discount?: string;
  error?: string;
  delivery_range: {
    min: number;
    max: number;
  }
  company: {
    id: number;
    name: string;
    picture: string;
    has_grouped_volumes: number;
  };
}

interface FreteState {
  fretes: Frete[];
  freteSelecionado: Frete | null;
}

const initialState: FreteState = {
  fretes: [],
  freteSelecionado: null,
};

const freteSlice = createSlice({
  name: "frete",
  initialState,
  reducers: {
    setFretes: (state, action: PayloadAction<Frete[]>) => {
      state.fretes = action.payload;
    },
    setFreteSelecionado: (state, action: PayloadAction<Frete>) => {
      state.freteSelecionado = action.payload;
    },
    clearFretes: (state) => {
      state.fretes = [];
      state.freteSelecionado = null;
    },
    clearFreteSelecionado: (state) => {
      state.freteSelecionado = null;
    },
  },
});

export const { setFretes, setFreteSelecionado, clearFretes, clearFreteSelecionado } = freteSlice.actions;
export default freteSlice.reducer;
