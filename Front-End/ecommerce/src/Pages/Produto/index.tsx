import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addItemToCart } from "../../Redux/cartSlice";
import { MdOutlineFavoriteBorder, MdFavorite } from "react-icons/md";
import { jwtDecode } from "jwt-decode";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/store";
import { canAddToCart } from "../../Hooks/addToCart";
import { useHandleBuyNow } from "../../Hooks/buyNow";

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

export default function Produto() {
  const { id } = useParams(); // Obtém o id do produto a partir da URL
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const user = useSelector((state: RootState) => state.user)
  const currentQuantity = useSelector((state: RootState) => state.cart.items.find(p => p.id === id)?.quantidade)
  const handleBuyNow = useHandleBuyNow();
  const [favoritos, setFavoritos] = useState<Product[]>(() => {
    const storedFavoritos = localStorage.getItem("favoritos");
    return storedFavoritos ? JSON.parse(storedFavoritos) : [];
  });

  const token = localStorage.getItem("token");
  let email = "";

  if (token) {
    const decoded: any = jwtDecode(token);
    email = decoded.sub; // o campo de email está no .sub do token
  }

  // Estado para armazenar o produto
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = async () => {
    try {
      const response = await axios.get<Product>(`http://localhost:8082/produto/${id}`);
      setProduct(response.data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Função para adicionar/remover dos favoritos
  const handleAddFavorite = async (product: Product) => {
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
      } else {
        await axios.post(
          `http://localhost:8081/cliente/favoritos`,
          { email, produtoId: product.id },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      // Atualiza a lista de favoritos e o estado do produto
      const updatedFavoritos = favoritos.map((p) =>
        p.id === product.id ? { ...p, isFavorited: !p.isFavorited } : p
      );

      // Se o produto não estiver nos favoritos, adiciona ele
      if (!updatedFavoritos.some((p) => p.id === product.id)) {
        updatedFavoritos.push({ ...product, isFavorited: true });
      }

      setFavoritos(updatedFavoritos);
      localStorage.setItem("favoritos", JSON.stringify(updatedFavoritos));
    } catch (err) {
      console.error("Erro ao alterar favorito:", err);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  // Exibição do componente
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    )
  }
  if (error) return <p>Erro: {error}</p>;

  if (!product) return <p>Produto não encontrado.</p>;

  const handleAddToCart = (product: Product) => {
    if (!user.user) {
      alert("Conecte-se a uma conta para adicionar item ao carrinho");
      navigate("/login");
      return;
    }

    const quantity = currentQuantity || 0;
  
    if (canAddToCart(product, quantity)) {
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

  // Verifica se o produto está favoritado
  const isFavorited = favoritos.some((p) => p.id === product.id && p.isFavorited);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow max-w-4xl mx-auto p-4 w-full">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Imagem do produto */}
          <div className="w-full lg:w-1/2 lg:sticky lg:top-6 h-fit">
            <img
              src={product.imagemUrl}
              alt={product.nome}
              className="w-full h-auto max-h-[500px] object-contain rounded-xl shadow-lg bg-white p-4"
            />
          </div>

          {/* Informações do produto */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
              {product.nome}
            </h1>
            
            <p className="text-lg lg:text-xl text-gray-600 leading-relaxed">
              {product.descricao}
            </p>

            <div className="mt-4">
              <p className="text-3xl lg:text-4xl font-extrabold text-blue-600">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(product.precoEmCentavos / 100)}
              </p>
            </div>

            {/* Ações mobile primeiro */}
            <div className="lg:hidden flex flex-col gap-3 mt-6">
              <div className="flex justify-between items-center">
                <button
                  className={`p-2 rounded-full ${
                    isFavorited ? "text-red-500" : "text-gray-500"
                  } hover:bg-gray-100 transition-colors`}
                  onClick={() => handleAddFavorite(product)}
                >
                  {isFavorited ? (
                    <MdFavorite size={32} />
                  ) : (
                    <MdOutlineFavoriteBorder size={32} />
                  )}
                </button>
                <div className="flex gap-3 flex-1 justify-end">
                  <button
                    className="flex-1 cursor-pointer bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors text-sm font-semibold"
                    onClick={() => handleAddToCart(product)}
                  >
                    Adicionar ao carrinho
                  </button>
                  <button
                    onClick={() => handleBuyNow(product)}
                    className="flex-1 cursor-pointer bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors text-sm font-semibold"
                  >
                    Comprar agora
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ações desktop */}
      <div className="bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="max-w-4xl mx-auto w-full">
          <div className="hidden lg:flex items-center justify-end gap-4">
            <button
              className={`p-2 rounded-full cursor-pointer ${
                isFavorited ? "text-red-500" : "text-gray-500"
              } hover:bg-gray-100 transition-colors`}
              onClick={() => handleAddFavorite(product)}
            >
              {isFavorited ? (
                <MdFavorite size={32} />
              ) : (
                <MdOutlineFavoriteBorder size={32} />
              )}
            </button>
            <button
              className="bg-blue-500 cursor-pointer text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors text-base font-semibold"
              onClick={() => handleAddToCart(product)}
            >
              Adicionar ao carrinho
            </button>
            <button
              onClick={() => handleBuyNow(product)}
              className="bg-green-500 cursor-pointer text-white px-8 py-3 rounded-lg hover:bg-green-600 transition-colors text-base font-semibold"
            >
              Comprar agora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
