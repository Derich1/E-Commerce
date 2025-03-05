import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess, logout } from "../../Redux/userSlice";
import { toast } from "react-toastify";
import { jwtDecode } from 'jwt-decode';

interface UserProfile {
  name: string;
  email: string;
  telefone: string;
  datanascimento: string;
}

interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

interface DecodedToken {
  exp: number;  // Propriedade de expiração
  [key: string]: any;  // Outras propriedades que o token pode ter
}

const Perfil: React.FC = () => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [activeTab, setActiveTab] = useState("perfil");
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const token = localStorage.getItem("token")

    const isTokenExpired = (token: string | null): boolean => {
      if (!token) {
        return true; // Se o token for null ou undefined, consideramos como expirado
      }
      try {
        const decoded = jwtDecode<DecodedToken>(token); // Fornecendo o tipo correto para o retorno
        const expirationTime = decoded.exp * 1000; // A expiração vem em segundos, por isso multiplicamos por 1000
        return Date.now() > expirationTime;
      } catch (e) {
        console.error('Erro ao decodificar token:', e);
        return true; // Considera expirado se não conseguir decodificar
      }
    };

    const formatPhoneNumber = (phone: any) => {
    
      // Remove todos os caracteres não numéricos
      const phoneNumber = phone.replace(/\D/g, '');
    
      return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7, 11)}`;
    };
    

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
            handleDisconnect()
          }
        }
      };
  
      if (!user && token) {
        fetchUserData();
      }
    }, [user, token]);
  
    useEffect(() => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        dispatch(loginSuccess({ token: storedToken, user: JSON.parse(storedUser) }));
        console.log(user)
      }

      if (isTokenExpired(token)) {
        handleDisconnect()
      }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };  
  
    const [formData, setFormData] = useState<ChangePasswordFormData>({
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });

    const handleDisconnect = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      dispatch(logout());
      setUser(null)
      navigate("/login");
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setSuccessMessage(null);
  
      const { currentPassword, newPassword, confirmNewPassword } = formData;
  
      // Validação: nova senha e confirmação devem ser iguais
      if (newPassword !== confirmNewPassword) {
        setError("A nova senha e a confirmação devem ser iguais.");
        return;
      }
  
      // Validação: nova senha não pode ser igual à senha atual
      if (currentPassword === newPassword) {
        setError("A nova senha não pode ser a mesma que a senha atual.");
        return;
      }

      console.log("Token enviado:", token);
  
      try {
        setLoading(true);
        
        const verifyResponse = await axios.post("http://localhost:8081/cliente/verify-password", 
        { senhaAtual: currentPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
       );
        if (!verifyResponse.data.valid) {
          setError("A senha atual está incorreta.");
          setLoading(false);
          return;
        }
  
        // Se a verificação passou, atualiza a senha do usuário.
        const response = await axios.post("http://localhost:8081/cliente/change-password", 
        { senhaNova: newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
        if (response.status === 200) {
          toast.success("Senha alterada com sucesso!")
          navigate("/")
        } else {
          setError("Erro ao alterar a senha. Tente novamente.");
        }
      } catch (err) {
        console.error(err);
        setError("Erro ao alterar a senha. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };
    
  
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
                <p className="mt-1 text-gray-800">{formatPhoneNumber(user.telefone)}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600">Data de Nascimento</label>
                <p className="mt-1 text-gray-800">{user.datanascimento}</p>
              </div>
              <button onClick={handleDisconnect} className="cursor-pointer mt-4 w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition">Sair da conta</button>
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
            <form onSubmit={handlePasswordChange} className="max-w-md mx-auto p-4">
              <h2 className="text-2xl font-bold mb-4">Alterar Senha</h2>
              
              {error && <div className="text-red-500 mb-4">{error}</div>}
              {successMessage && <div className="text-green-500 mb-4">{successMessage}</div>}
              
              <div className="mb-4">
                <label className="block text-gray-700">Senha Atual</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700">Nova Senha</label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700">Confirme a Nova Senha</label>
                <input
                  type="password"
                  name="confirmNewPassword"
                  value={formData.confirmNewPassword}
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full cursor-pointer bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
              >
                {loading ? "Alterando..." : "Alterar Senha"}
              </button>
            </form>
          </div>
        )}
      </main>
      </div>
    );
  };
  
  export default Perfil;

