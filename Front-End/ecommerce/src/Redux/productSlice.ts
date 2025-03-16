import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type Product = {
  id: string;
  nome: string;
  precoEmCentavos: number;
  imagemUrl: string;
  marca: string;
  categoria: string;
  width: number;
  height: number;
  length: number;
  weight: number;
};

type ProductState = {
  allProducts: Product[];
  filteredProducts: Product[];
};

const initialState: ProductState = {
  allProducts: [],
  filteredProducts: [],
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setProducts(state, action: PayloadAction<Product[]>) {
      state.allProducts = action.payload;
      state.filteredProducts = action.payload;
    },
    filterProducts(state, action: PayloadAction<string>) {
      if (action.payload === "Todos") {
        state.filteredProducts = state.allProducts;
      } else {
        state.filteredProducts = state.allProducts.filter(
          (product) => product.categoria === action.payload
        );
      }
    },
  },
});


export const { setProducts, filterProducts } = productSlice.actions;
export default productSlice.reducer;
