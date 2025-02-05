import React, { useEffect, useState } from "react";
import axios from "axios";

interface UserProfile {
  name: string;
  email: string;
  telefone: string;
  datanascimento: string;
}

const Perfil: React.FC = () => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const token = localStorage.getItem("token");
  
    useEffect(() => {
      const fetchUserData = async () => {
        try {
          const response = await axios.get("http://cliente:8081/cliente/perfil", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUser(response.data);
        } catch (error) {
          console.error("Erro ao buscar dados do perfil:", error);
        }
      };
  
      if (token) {
        fetchUserData();
      }
    }, [token]);
  
    // Adicionando verificação para evitar erro de user ser null
    if (!user) {
      return <p className="text-center text-gray-500">Carregando...</p>;
    }
  
    return (
      <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
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
    );
  };
  
  export default Perfil;
  