import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type Product = {
  promotionalPrice?: number;
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
  estoque: number;
  promotionStart?: number;
  promotionEnd?: number;
};

type ProductState = {
  allProducts: Product[];
  filteredProducts: Product[]; 
  searchQuery: string; 
  selectedCategory: string;
};

const initialState: ProductState = {
  allProducts: [],
  filteredProducts: [],
  searchQuery: "",
  selectedCategory: "Todos",
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setProducts(state, action: PayloadAction<Product[]>) {
      state.allProducts = action.payload;
      state.filteredProducts = action.payload;
    },
    updateSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    updateSelectedCategory(state, action: PayloadAction<string>) {
      state.selectedCategory = action.payload;
    },
    applyFilters(state) {
      const query = state.searchQuery.toLowerCase();
      const category = state.selectedCategory;
      
      state.filteredProducts = state.allProducts.filter((product) => {
        const matchesQuery = product.nome.toLowerCase().includes(query);
        const matchesCategory = category === "Todos" || product.categoria === category;
        return matchesQuery && matchesCategory;
      });
    }
  },
});


export const { setProducts,
  updateSearchQuery,
  updateSelectedCategory,
  applyFilters, } = productSlice.actions;
export default productSlice.reducer;
