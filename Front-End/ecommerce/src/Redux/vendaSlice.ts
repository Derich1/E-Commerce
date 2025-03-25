import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ProdutoComprado {
  id: string;
  nome: string;
  precoEmCentavos: number;
  quantidade: number;
  imagemUrl: string;
  width: number;
  height: number;
  length: number;
  weight: number;
}

interface VendaState {
  vendaId: string;
  clienteId: string;
  produtos: ProdutoComprado[];
  total: number;
  totalPeso: number;
  status: string;
  metodoPagamento: string;
  statusPagamento: string;
  enderecoEntrega: string;
  dataVenda: string;
  preferenceId: string;
  immediatePurchase?: ProdutoComprado | null
}

const initialState: VendaState = {
  vendaId: "",
  clienteId: "",
  produtos: [],
  total: 0,
  totalPeso: 0,
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
    setPesoTotal: (state, action) => {
      state.totalPeso = action.payload;
    },
    setProdutos: (state, action) => {
      state.produtos = action.payload;
    },
    setVendaId: (state, action: PayloadAction<string>) => {
      state.vendaId = action.payload;
    },
    setPreferenceId: (state, action: PayloadAction<string>) => {
      state.preferenceId = action.payload;
    },
    setTotal: (state, action: PayloadAction<number>) => {
      state.total = action.payload;
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

export const { setVenda, setProdutos, setPesoTotal, setVendaId, setPreferenceId, setTotal, resetVenda, setImmediatePurchase, clearImmediatePurchase } = vendaSlice.actions;
export default vendaSlice.reducer;
