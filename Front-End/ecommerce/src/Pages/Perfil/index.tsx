import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  name: string;
  email: string;
  telefone: string;
  datanascimento: string;
}

const Perfil: React.FC = () => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("perfil");
    const navigate = useNavigate()

  
    useEffect(() => {
      const fetchUserData = async () => {
        try {
          const response = await axios.get("http://localhost:8081/cliente/perfil", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUser(response.data);
        } catch (error: any) {
          console.error("Erro ao buscar dados do perfil:", error);

          if (error.response?.status === 401) {
            localStorage.removeItem("token"); // 🔴 Remove token inválido
            navigate("/login"); // 🔄 Redireciona para login
          }
        }
      };
  
      if (token) {
        fetchUserData();
      }
    }, [token]);
  
    useEffect(() => {
      const storedToken = localStorage.getItem("token");
      setToken(storedToken); // Atualiza o estado com o token salvo
  
      if (!storedToken) {
        navigate("/login");
      }
    }, [navigate]);
  
  
    // Se os dados do usuário ainda estão carregando, exibir um loading
    if (!user) {
      return <p className="text-center mt-10 text-gray-600">Carregando...</p>;
    }
  
    return (
      <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-600 text-white p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-6 text-center">Menu</h2>
        <button
          className={`text-left w-full py-3 px-4 rounded-lg transition cursor-pointer ${
            activeTab === "perfil" ? "bg-blue-500" : "hover:bg-blue-500"
          }`}
          onClick={() => setActiveTab("perfil")}
        >
          Perfil
        </button>
        <button
          className={`text-left w-full py-3 px-4 rounded-lg transition cursor-pointer ${
            activeTab === "pedidos" ? "bg-blue-500" : "hover:bg-blue-500"
          }`}
          onClick={() => setActiveTab("pedidos")}
        >
          Meus Pedidos
        </button>
        <button
          className={`text-left w-full py-3 px-4 rounded-lg transition cursor-pointer ${
            activeTab === "senha" ? "bg-blue-500" : "hover:bg-blue-500"
          }`}
          onClick={() => setActiveTab("senha")}
        >
          Alterar Senha
        </button>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-10">
        {activeTab === "perfil" && (
          <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Dados do Perfil</h1>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600">Nome</label>
                <p className="mt-1 text-gray-800">{user.name}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600">E-mail</label>
                <p className="mt-1 text-gray-800">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600">Telefone</label>
                <p className="mt-1 text-gray-800">{user.telefone}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600">Data de Nascimento</label>
                <p className="mt-1 text-gray-800">{user.datanascimento}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "pedidos" && (
          <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Meus Pedidos</h1>
            <p className="text-center text-gray-600">Nenhum pedido encontrado.</p>
          </div>
        )}

        {activeTab === "senha" && (
          <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h1 className="cursor-pointer text-3xl font-bold text-center text-gray-800 mb-6">Alterar Senha</h1>
            <form>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-600">Senha Atual</label>
                <input
                  type="password"
                  className="w-full mt-1 p-3 border rounded-lg"
                  placeholder="Digite sua senha atual"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-600">Nova Senha</label>
                <input
                  type="password"
                  className="w-full mt-1 p-3 border rounded-lg"
                  placeholder="Digite sua nova senha"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-600">Confirme a Nova Senha</label>
                <input
                  type="password"
                  className="w-full mt-1 p-3 border rounded-lg"
                  placeholder="Confirme sua nova senha"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Alterar Senha
              </button>
            </form>
          </div>
        )}
      </main>
      </div>
    );
  };
  
  export default Perfil;
  