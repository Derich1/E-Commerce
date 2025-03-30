import { combineReducers, configureStore } from "@reduxjs/toolkit";
import storage from 'redux-persist/lib/storage'; // usa localStorage no navegador
import productReducer from "./productSlice";
import cartReducer from "./cartSlice"
import vendaReducer from "./vendaSlice"
import userReducer from "./userSlice"
import enderecoReducer from "./enderecoSlice"
import freteReducer from "./freteSlice"
import { persistReducer, persistStore } from "redux-persist";
import packageReducer from "./packageSlice"

const persistConfig = {
  key: 'root', // chave de persistência
  storage,     // armazenamento (localStorage)
  whitelist: ['user', 'cart', 'products'] // reducers que serão persistidos (ex.: user)
};

const rootReducer = combineReducers({
  products: productReducer,
  cart: cartReducer,
  venda: vendaReducer,
  user: userReducer,
  endereco: enderecoReducer,
  frete: freteReducer,
  package: packageReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);


// Tipos para TypeScript
export type RootState = ReturnType<typeof rootReducer>;
