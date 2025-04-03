import { Route, Routes } from "react-router-dom";
import Footer from "../Components/Footer";
import { ToastContainer } from "react-toastify";
import Header from "../Components/Header";
import Home from "../Pages/Home";
import Cadastro from "../Pages/Cadastro";
import PrivateRoute from "./PrivateRoute";
import Perfil from "../Pages/Perfil";
import Favoritos from "../Pages/Favoritos";
import Produto from "../Pages/Produto";
import Compra from "../Pages/Compra";
import Pagamento from "../Pages/Pagamento";
import StatusPage from "../Pages/StatusPage";
import Login from "../Pages/Login"
import { AdminPanel } from "./admin";

export default function AppRoutes() {
    
    const categorias = ["Todos", "Perfumes", "Desodorantes", "Colônias", "Lábios"]

    return(
            <div className="flex flex-col min-h-screen">
            <Routes>
                <Route path="/admin/*" element={<AdminPanel />} />
            </Routes>
            <Header categories={categorias} />
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                style={{ zIndex: 100000 }} // Valor maior que o do modal
            />
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
        <Footer />
      </div>
    )
}