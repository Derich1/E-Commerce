import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ProdutoComprado {
  id: string;
  nome: string;
  precoEmCentavos: number;
  quantidade: number;
  imagemUrl: string;
}

interface VendaState {
  clienteId: string;
  produtos: ProdutoComprado[];
  total: number;
  status: string;
  metodoPagamento: string;
  statusPagamento: string;
  enderecoEntrega: string;
  dataVenda: string;
  preferenceId: string;
  immediatePurchase?: ProdutoComprado | null
}

const initialState: VendaState = {
  clienteId: "",
  produtos: [],
  total: 0,
  status: "",
  metodoPagamento: "",
  statusPagamento: "",
  enderecoEntrega: "",
  dataVenda: "",
  preferenceId: "",
  immediatePurchase: null
};

const vendaSlice = createSlice({
  name: "venda",
  initialState,
  reducers: {
    setVenda: (state, action: PayloadAction<VendaState>) => {
      return { ...state, ...action.payload };
    },
    setPreferenceId: (state, action: PayloadAction<string>) => {
      state.preferenceId = action.payload;
    },
    resetVenda: () => initialState, // Reseta os dados da venda
    setImmediatePurchase: (state, action: PayloadAction<ProdutoComprado>) => {
      state.immediatePurchase = action.payload;
    },
    clearImmediatePurchase: (state) => {
      state.immediatePurchase = null;
    },
  },
});

export const { setVenda, setPreferenceId, resetVenda, setImmediatePurchase, clearImmediatePurchase } = vendaSlice.actions;
export default vendaSlice.reducer;
