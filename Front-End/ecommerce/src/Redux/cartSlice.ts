import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type CartItem = {
  id: string;
  nome: string;
  precoEmCentavos: number;
  quantidade: number;
  imagemUrl: string;
  weight: number;
  estoque: number;
  width: number;
  height: number;
  length: number;
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
      state.items = state.items
        .map(item => {
          if (item.id === action.payload.id) {
            // Atualiza a quantidade primeiro
            return { 
              ...item, 
              quantidade: Math.max(0, action.payload.newQuantity)
            };
          }
          return item;
        })
        // Remove itens com quantidade 0 após atualização
        .filter(item => item.quantidade > 0);
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
