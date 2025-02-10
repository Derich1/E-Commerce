import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ProdutoComprado {
  produtoId: string;
  quantidade: number;
  nome: string;
  precoUnitario: number;
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
};

const vendaSlice = createSlice({
  name: "venda",
  initialState,
  reducers: {
    setVenda: (state, action: PayloadAction<VendaState>) => {
      return { ...state, ...action.payload };
    },
    resetVenda: () => initialState, // Reseta os dados da venda
  },
});

export const { setVenda, resetVenda } = vendaSlice.actions;
export default vendaSlice.reducer;
