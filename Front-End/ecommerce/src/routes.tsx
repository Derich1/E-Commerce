import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./Pages/Home";
import Perfil from "./Pages/Perfil";
import Favoritos from "./Pages/Favoritos";
import Header from "./Components/Header";
import FilterModal from "./Components/FilterModal";

export default function AppRoutes() {
    
    const categorias = ["Perfumes", "Desodorantes", "Colônias", "Lábios"]

    const handleFilter = (category: string) => {
        console.log("Categoria selecionada:", category);
        // Lógica para filtrar os produtos
      };
    

    return(
        <BrowserRouter>
            <Header categories={categorias}/>
            <FilterModal categories={categorias} onFilter={handleFilter}/>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/perfil" element={<Perfil/>}/>
                <Route path="/favoritos" element={<Favoritos/>}/>
            </Routes>
        </BrowserRouter>
    )
}