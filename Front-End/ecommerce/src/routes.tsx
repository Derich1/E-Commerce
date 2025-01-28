import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./Pages/Home";
import Perfil from "./Pages/Perfil";
import Favoritos from "./Pages/Favoritos";
import Header from "./Components/Header";
import FilterModal from "./Components/FilterModal";
import Produto from "./Pages/Produto";
import Footer from "./Components/Footer";

export default function AppRoutes() {
    
    const categorias = ["Todos", "Perfumes", "Desodorantes", "Colônias", "Lábios"]

    return(
        <BrowserRouter>
        <div className="main-container">
            <Header categories={categorias} />
            <FilterModal categories={categorias}/>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/perfil" element={<Perfil />} />
                    <Route path="/favoritos" element={<Favoritos />} />
                    <Route path="/produto/:id" element={<Produto/>} />
                </Routes>
            <Footer/>
        </div>
        </BrowserRouter>
    )
}