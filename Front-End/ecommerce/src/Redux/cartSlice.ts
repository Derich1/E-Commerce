import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type CartItem = {
  id: string;
  nome: string;
  precoEmCentavos: number;
  quantidade: number;
  imagemUrl: string;
  weight: number;
  estoque: number;
};

type CartState = {
  items: CartItem[];
};

const initialState: CartState = {
  items: [], // Carrinho começa vazio
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItemToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id
      );
      if (existingItem) {
        // Incrementa a quantidade se o item já existir no carrinho
        existingItem.quantidade += action.payload.quantidade;
      } else {
        state.items.push(action.payload); // Adiciona o item ao carrinho
      }
    },
    updateCartItem: (
      state,
      action: PayloadAction<{ id: string; newQuantity: number }>
    ) => {
      const item = state.items.find((item) => item.id === action.payload.id);
      if (item) {
        item.quantidade = action.payload.newQuantity;
      }
    },
    removeItemFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    clearCart: (state) => {
      state.items = [];
    },    
  },
});

export const { addItemToCart, updateCartItem, removeItemFromCart, clearCart } = cartSlice.actions;

export const updateCartItemAction = updateCartItem;

export default cartSlice.reducer;
