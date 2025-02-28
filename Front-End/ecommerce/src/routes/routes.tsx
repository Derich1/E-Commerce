import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "../Pages/Home";
import Favoritos from "../Pages/Favoritos";
import Header from "../Components/Header";
import Produto from "../Pages/Produto";
import Footer from "../Components/Footer";
import Cadastro from "../Pages/Cadastro";
import Login from "../Pages/Login";
import Perfil from "../Pages/Perfil";
import PrivateRoute from "./PrivateRoute";
import Compra from "../Pages/Compra";
import Pagamento from "../Pages/Pagamento";
import StatusPage from "../Pages/StatusPage";
import { ToastContainer } from "react-toastify";

export default function AppRoutes() {
    
    const categorias = ["Todos", "Perfumes", "Desodorantes", "Colônias", "Lábios"]

    return(
        <BrowserRouter>
        <div className="flex flex-col min-h-screen">
            <Header categories={categorias} />
            <ToastContainer />
                <main className="flex-grow">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/cadastro" element={<Cadastro />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/favoritos" element={<Favoritos />} />
                    <Route path="/produto/:id" element={<Produto/>} />
                    <Route path="/perfil" element={<PrivateRoute> <Perfil/> </PrivateRoute>} />
                    <Route path="/compra" element={<Compra/>} />
                    <Route path="/pagamento" element={<Pagamento/>} />
                    <Route path="/status/:status" element={<StatusPage/>} />
                </Routes>
                </main>
            <Footer/>
        </div>
        </BrowserRouter>
    )
}