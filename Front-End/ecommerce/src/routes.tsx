import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./Pages/Home";
import Perfil from "./Pages/Perfil";
import Favoritos from "./Pages/Favoritos";
import Header from "./Components/Header";

export default function AppRoutes() {
    
    const categorias = ["Vestidos", "Roupas", "Sapatos", "Acessórios"]

    return(
        <BrowserRouter>
            <Header categories={categorias}/> 
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/perfil" element={<Perfil/>}/>
                <Route path="/favoritos" element={<Favoritos/>}/>
            </Routes>
        </BrowserRouter>
    )
}