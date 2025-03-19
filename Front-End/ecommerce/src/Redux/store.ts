import { configureStore } from "@reduxjs/toolkit";
import productReducer from "./productSlice";
import cartReducer from "./cartSlice"
import vendaReducer from "./vendaSlice"
import userReducer from "./userSlice"
import enderecoReducer from "./enderecoSlice"
import freteReducer from "./freteSlice"

export const store = configureStore({
  reducer: {
    products: productReducer,
    cart: cartReducer,
    venda: vendaReducer,
    user: userReducer,
    endereco: enderecoReducer,
    frete: freteReducer
  },
});

// Tipos para TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
