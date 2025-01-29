import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "../Pages/Home";
import Favoritos from "../Pages/Favoritos";
import Header from "../Components/Header";
import FilterModal from "../Components/FilterModal";
import Produto from "../Pages/Produto";
import Footer from "../Components/Footer";
import Cadastro from "../Pages/Cadastro";
import Login from "../Pages/Login";
import Perfil from "../Pages/Perfil";
import PrivateRoute from "./PrivateRoute";

export default function AppRoutes() {
    
    const categorias = ["Todos", "Perfumes", "Desodorantes", "Colônias", "Lábios"]

    return(
        <BrowserRouter>
        <div className="flex flex-col min-h-screen">
            <Header categories={categorias} />
            <main className="flex-grow">
                <FilterModal categories={categorias}/>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/cadastro" element={<Cadastro />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/favoritos" element={<Favoritos />} />
                        <Route path="/produto/:id" element={<Produto/>} />
                        <Route path="/perfil" element={<PrivateRoute> <Perfil/> </PrivateRoute>} />
                    </Routes>
            </main>
            <Footer/>
        </div>
        </BrowserRouter>
    )
}