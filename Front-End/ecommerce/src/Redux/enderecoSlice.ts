import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface EnderecoState {
  cep: string;
  enderecoCompleto: string;
}

const initialState: EnderecoState = {
  cep: "",
  enderecoCompleto: "",
};

const enderecoSlice = createSlice({
  name: "endereco",
  initialState,
  reducers: {
    setCep: (state, action: PayloadAction<string>) => {
      state.cep = action.payload;
    },
    setEnderecoCompleto: (state, action: PayloadAction<string>) => {
      state.enderecoCompleto = action.payload;
    },
    resetEndereco: (state) => {
      state.cep = "";
      state.enderecoCompleto = "";
    },
  },
});

export const { setCep, setEnderecoCompleto, resetEndereco } = enderecoSlice.actions;
export default enderecoSlice.reducer;
