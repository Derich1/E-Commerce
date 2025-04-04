import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
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
import { MainLayout } from "../Pages/MainLayout";

export default function AppRoutes() {
    

    return(
        <div className="flex flex-col min-h-screen">
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
            style={{ zIndex: 100000 }}
          />
      
      <Routes>
        {/* Rotas principais com layout comum */}
        <Route element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="cadastro" element={<Cadastro />} />
          <Route path="login" element={<Login />} />
          <Route path="favoritos" element={<Favoritos />} />
          <Route path="produto/:id" element={<Produto />} />
          <Route path="perfil" element={<PrivateRoute><Perfil /></PrivateRoute>} />
          <Route path="compra" element={<Compra />} />
          <Route path="pagamento" element={<Pagamento />} />
          <Route path="status/:status" element={<StatusPage />} />
        </Route>

        {/* Rota do Admin com layout próprio */}
        <Route path="/admin/*" element={<AdminPanel />} />
      </Routes>
    </div>
    )
}