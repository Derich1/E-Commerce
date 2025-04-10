import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../Redux/userSlice";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { useAuth } from "../../AuthContext";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/store";

interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

interface Produto {
  nome: string;
  precoUnitario: number;
  quantidade: number;
  imagemUrl: string;
}

interface Venda {
  id: string;
  dataVenda: Date;
  produtos: Produto[];
  total: number;
  enderecoEntrega: string;
  metodoPagamento: string;
  status: string;
}


const Perfil: React.FC = () => {

    const [activeTab, setActiveTab] = useState("perfil");
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [vendas, setVendas] = useState<Venda[]>([])
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const email = useSelector((state: RootState) => state.user.user?.email)
    const nome = useSelector((state: RootState) => state.user.user?.nome)
    const dataNascimento = useSelector((state: RootState) => state.user.user?.datanascimento)
    const telefone = useSelector((state: RootState) => state.user.user?.telefone)
    const { token } = useAuth()
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const paymentMethods: any = {
      credit_card: "Cartão de Crédito",
      debit_card: "Cartão de Débito",
      boleto: "Boleto Bancário",
      pix: "Pix"
    };

    const capitalizeFirstLetter = (string: string) => {
      return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    };

    const formatId = (id: any) => {
      return parseInt(id.split("-")[0], 16);
    }

    const formatPhoneNumber = (phone: string | undefined): string => {
      if (!phone) return "";
      const phoneNumber = phone.replace(/\D/g, '');
      return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7, 11)}`;
    };
    

    const { user } = useAuth()

    useEffect(() => {
      if (activeTab === "pedidos") {
        handlePedidos();
      }
    }, [activeTab]);

    const showMore = () => {
      if (hasMore) {
        setPage((prevPage) => prevPage + 1); // Incrementa o número da página
      }
    };
    

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };  
  
    const [formData, setFormData] = useState<ChangePasswordFormData>({
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });

    const handleDisconnect = () => {
      dispatch(logout());
      navigate("/login");
    };

    const handlePedidos = async () => {
      setLoading(true);

      try {
        const response = await axios.get("http://localhost:8083/venda/pedidos", {
          params: {
            email: email,
            page: page,
            size: 10,
          },
        });
        // Atualiza o estado com as vendas carregadas
        setVendas((prevVendas) => [...prevVendas, ...response.data.content]);

        // Se a resposta contiver menos de 10 itens, significa que não há mais resultados
        setHasMore(response.data.content.length === 10);
      } catch (e) {
        console.log(e)
      } finally {
        setLoading(false);
      }
    }

    useEffect(() => {
      handlePedidos();
    }, [page]);

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
    
    if (!user) {
      handleDisconnect()
    }
  
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
        <div className="sticky top-4 md:hidden h-0 z-40">
          <button 
            className="absolute left-4 top-4 md:hidden z-40 p-3 text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-500 transition-all"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            ☰
          </button>
        </div>
        {isMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 md:hidden z-40"
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      {/* Sidebar */}
      <aside className={
        `fixed md:relative left-0 top-0 h-full w-64 md:mt-10 md:ml-5 md:max-w-60 rounded-lg transform transition-transform duration-200 ease-in-out bg-rose-200 shadow-lg text-black p-6 flex-1 z-50 ${
        isMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Menu</h2>
        <button
          className="md:hidden p-2 hover:bg-blue-500 rounded-lg"
          onClick={() => setIsMenuOpen(false)}
        >
          ✕
        </button>
      </div>
      <div className="space-y-2">
        <button
          className={`w-full text-left py-3 px-4 rounded-lg transition ${
            activeTab === "perfil" ? "bg-rose-300" : "bg-rose-200"
          }`}
          onClick={() => {
            setActiveTab("perfil");
            setIsMenuOpen(false);
          }}
        >
          Perfil
        </button>
        <button
          className={`w-full text-left py-3 px-4 rounded-lg transition ${
            activeTab === "pedidos" ? "bg-rose-300" : "bg-rose-200"
          }`}
          onClick={() => {
            setActiveTab("pedidos") 
            setIsMenuOpen(false)
          }}
        >
          Meus Pedidos
        </button>
        <button
          className={`w-full text-left py-3 px-4 rounded-lg transition ${
            activeTab === "senha" ? "bg-rose-300" : "bg-rose-200"
          }`}
          onClick={() => {
            setActiveTab("senha") 
            setIsMenuOpen(false)
          }}
        >
          Alterar Senha
        </button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-4 md:p-10">
        {activeTab === "perfil" && (
          <div className="max-w-3xl mx-auto p-4 md:p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-4 md:mb-6">Dados do Perfil</h1>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600">Nome</label>
                <p className="mt-1 text-gray-800">{nome}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600">E-mail</label>
                <p className="mt-1 text-gray-800">{email}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600">Telefone</label>
                <p className="mt-1 text-gray-800">{formatPhoneNumber(telefone)}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600">Data de Nascimento</label>
                <p className="mt-1 text-gray-800">{dataNascimento}</p>
              </div>
              <button onClick={handleDisconnect} className="cursor-pointer mt-4 w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition">Sair da conta</button>
            </div>
          </div>
        )}

        {activeTab === "pedidos" && (
          <div className="max-w-3xl mx-auto p-4 md:p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-4 md:mb-6">Meus Pedidos</h1>
            {vendas.length > 0 ? (
              <ul className="space-y-4">
                {vendas.map((venda) => (
                  <li key={venda.id} className="border p-3 md:p-4 rounded-lg shadow-sm">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2">
                      <h2 className="text-lg md:text-xl font-semibold text-gray-700">
                        Pedido: {formatId(venda.id)}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1 md:mt-0">
                        Data: {format(venda.dataVenda, "dd/MM/yyyy")}
                      </p>
                    </div>
                    <ul className="space-y-2">
                      {venda.produtos.map((produto, idx) => (
                        <li
                          key={idx}
                          className="flex flex-col  md:flex-row items-start gap-4 p-2 border-b last:border-b-0"
                        >
                          <img
                            src={produto.imagemUrl}
                            alt={produto.nome}
                            className="w-12 h-12 md:w-16 md:h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="text-lg font-medium text-gray-800">
                              {produto.nome}
                            </p>
                            <p className="text-sm text-gray-600">
                              Quantidade: {produto.quantidade}
                            </p>
                            <span className="text-sm text-gray-600">Preço: </span>
                            <span className="text-sm text-gray-600">
                            {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                            }).format(produto.precoUnitario)}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                    {/* Campos adicionais na última linha de cada pedido */}
                    <div className="mt-4">
                      <span className="block text-sm text-gray-800">
                        Total: R$ {venda.total}
                      </span>
                      <span className="block text-sm text-gray-800">
                        Método de pagamento: {paymentMethods[venda.metodoPagamento || venda.metodoPagamento]}
                      </span>
                      <span className="block text-sm text-gray-800">
                        Status: {capitalizeFirstLetter(venda.status)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              
            ) : (
              <p className="text-center text-gray-600">Nenhum pedido encontrado.</p>
            )}

            {loading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    </div>
                  ) : (
                    hasMore && (
                      <div className="text-center mt-4">
                        <button
                          onClick={showMore}
                          className="w-full md:w-auto cursor-pointer px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
                        >
                          Mostrar mais
                        </button>
                      </div>
                    )
                  )}

                  {!hasMore && (
                    <p className="text-center text-gray-600 mt-4">Não há mais pedidos.</p>
              )}
          </div>
          
        )}


        {activeTab === "senha" && (
          <div className="max-w-3xl mx-auto p-4 md:p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-4 md:mb-6">Alterar Senha</h1>
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

