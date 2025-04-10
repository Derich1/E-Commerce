import { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addItemToCart } from "../../Redux/cartSlice";
import { canAddToCart } from "../../Hooks/addToCart";
import { RootState } from "../../Redux/store";
import { useAuth } from "../../Hooks/useAuth";
import { useHandleBuyNow } from "../../Hooks/buyNow";
import { jwtDecode } from "jwt-decode";
import { Link, useNavigate } from "react-router-dom";

type Product = {
  id: string;
  nome: string;
  precoEmCentavos: number;
  imagemUrl: string;
  marca: string;
  categoria: string;
  width: number;
  height: number;
  length: number;
  weight: number;
  isFavorited?: boolean;
  descricao: string;
  estoque: number;
};

const Favoritos = () => {
  const [favoritos, setFavoritos] = useState<Product[]>(() => {
    const storedFavoritos = localStorage.getItem("favoritos");
    return storedFavoritos ? JSON.parse(storedFavoritos) : [];
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch()
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const handleBuyNow = useHandleBuyNow();
  const navigate = useNavigate()

  const { token } = useAuth()
  let email = "";

  if (token) {
    const decoded: any = jwtDecode(token);
    email = decoded.sub;
  }

  useEffect(() => {
    if (!token) {
      alert("Você precisa estar logado para acessar os favoritos!")
      navigate("/login")
    }
  }, [])

  const fetchFavoritos = async () => {
    if (!token) {
      setLoading(false)
      return;
    }

    try {
      const response = await axios.get<Product[]>("http://localhost:8081/cliente/favoritos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const produtos = response.data.map((product) => ({
        ...product,
        isFavorited: true,
      }));

      setFavoritos(produtos);
      localStorage.setItem("favoritos", JSON.stringify(produtos));
      setLoading(false);
    } catch (err) {
      setError("Erro ao buscar favoritos");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavoritos();
  }, [token]);

  const handleToggleFavorite = async (product: Product) => {
    if (!token) return;

    try {
      if (product.isFavorited) {
        await axios.delete(
          `http://localhost:8081/cliente/favoritos`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            data: { email, produtoId: product.id },
          }
        );

        // Remover o produto da lista de favoritos
        const updatedFavoritos = favoritos.filter((p) => p.id !== product.id);
        setFavoritos(updatedFavoritos);
        localStorage.setItem("favoritos", JSON.stringify(updatedFavoritos)); // Atualiza no localStorage
      } else {
        await axios.post(
          `http://localhost:8081/cliente/${email}/favorito/${product.id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Adiciona o produto aos favoritos
        const updatedFavoritos = [...favoritos, { ...product, isFavorited: true }];
        setFavoritos(updatedFavoritos);
        localStorage.setItem("favoritos", JSON.stringify(updatedFavoritos)); // Atualiza no localStorage
      }
    } catch (err) {
      console.error("Erro ao alterar favorito:", err);
    }
  };

  const handleAddToCart = (product: Product) => {
    const currentQuantity = cartItems.find(p => p.id === product.id)?.quantidade || 0;
      
        if (canAddToCart(product, currentQuantity)) {
          dispatch(
            addItemToCart({
              id: product.id,
              nome: product.nome,
              precoEmCentavos: product.precoEmCentavos,
              quantidade: 1,
              imagemUrl: product.imagemUrl,
              weight: product.weight,
              estoque: product.estoque,
              width: product.width,
              height: product.height,
              length: product.length
            })
          );
        } else {
          alert("Estoque insuficiente para adicionar este item.");
        }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <h2 className="text-center text-3xl font-bold text-gray-800 mb-8 mt-4">
        Meus Favoritos
      </h2>

      {/* Estados de loading e erro */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando seus favoritos...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg max-w-2xl mx-auto text-center">
          {error}
        </div>
      )}

      {/* Lista vazia */}
      {!loading && !error && favoritos.length === 0 && (
        <div className="text-center max-w-2xl mx-auto py-12">
          <div className="inline-block mb-4">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <p className="text-xl text-gray-600">Nenhum produto favorito encontrado</p>
          <p className="text-gray-500 mt-2">Comece adicionando produtos aos seus favoritos!</p>
        </div>
      )}

      {/* Lista de favoritos */}
      {!loading && !error && favoritos.length > 0 && (
        <ul className="max-w-4xl mx-auto space-y-4">
        {favoritos.map((product) => (
          product.estoque > 0 ? (
          <li
            key={product.id}
            className="flex flex-col p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-4 w-full">
              {/* Seção de informações do produto */}
              <div className="flex flex-1 min-w-0">
                <img
                  src={product.imagemUrl}
                  alt={product.nome}
                  className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg flex-shrink-0"
                />
                <div className="ml-3 md:ml-4 min-w-0 flex flex-col">
                  <h3 className="text-base md:text-lg font-semibold text-gray-800 truncate">
                    {product.nome}
                  </h3>
                  <p className="text-lg md:text-xl font-bold text-green-600 mt-1">
                    R$ {(product.precoEmCentavos / 100).toFixed(2).replace('.', ',')}
                  </p>
                </div>
              </div>
  
              {/* Botões alinhados horizontalmente em telas grandes */}
              <div className="flex flex-col md:flex-row gap-2 flex-wrap md:flex-nowrap">
                <button
                  onClick={() => handleToggleFavorite(product)}
                  className="px-4 py-2 cursor-pointer text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center md:min-w-[120px]"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  Remover
                </button>
                
                <button
                  onClick={() => handleAddToCart(product)}
                  className="px-4 py-2 cursor-pointer text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center md:min-w-[120px]"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Carrinho
                </button>
  
                <button
                  onClick={() => handleBuyNow(product)}
                  className="px-4 py-2 cursor-pointer text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center md:min-w-[120px]"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
                  </svg>
                  Comprar
                </button>
              </div>
            </div>
          </li>
          ) : (
            <li
            key={product.id}
            className="flex flex-col p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-4 w-full">
              {/* Seção de informações do produto */}
              <div className="flex flex-1 min-w-0">
                <img
                  src={product.imagemUrl}
                  alt={product.nome}
                  className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg flex-shrink-0"
                />
                <div className="ml-3 md:ml-4 min-w-0 flex flex-col">
                  <h3 className="text-base md:text-lg font-semibold text-gray-800 truncate">
                    {product.nome}
                  </h3>
                  <p className="text-lg md:text-xl font-bold text-gray-800 mt-1">
                    Esgotado
                  </p>
                </div>
              </div>
  
              {/* Botões alinhados horizontalmente em telas grandes */}
              <div className="flex flex-col md:flex-row gap-2 flex-wrap md:flex-nowrap">
                <button
                  onClick={() => handleToggleFavorite(product)}
                  className="px-4 py-2 cursor-pointer text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center md:min-w-[120px]"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  Remover
                </button>
                <Link 
                  to={`/produto/${product.id}`} 
                  className="px-4 py-2 cursor-pointer text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center md:min-w-[120px]"
                >
                  Visualizar produto
                </Link>
              </div>
            </div>
          </li>
          )
        ))}
      </ul>
      )}
    </div>
  )
}

export default Favoritos;
