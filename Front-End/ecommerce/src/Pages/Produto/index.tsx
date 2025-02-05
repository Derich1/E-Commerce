import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addItemToCart } from "../../Redux/cartSlice";
import { MdOutlineFavoriteBorder, MdFavorite } from "react-icons/md";
import { jwtDecode } from "jwt-decode";

type Product = {
  id: string;
  nome: string;
  precoEmCentavos: number;
  imagemUrl: string;
  marca: string;
  descricao: string;
  isFavorited?: boolean;
};

export default function Produto() {
  const { id } = useParams(); // Obtém o id do produto a partir da URL
  const dispatch = useDispatch();

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
      const response = await axios.get<Product>(`http://produto:8082/produto/${id}`);
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
          `http://cliente:8081/cliente/favoritos`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            data: { email, produtoId: product.id },
          }
        );
      } else {
        await axios.post(
          `http://cliente:8081/cliente/favoritos`,
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
  if (loading) return <p>Carregando produto...</p>;
  if (error) return <p>Erro: {error}</p>;

  if (!product) return <p>Produto não encontrado.</p>;

  const handleAddToCart = () => {
    if (product) {
      dispatch(
        addItemToCart({
          id: product.id,
          nome: product.nome,
          precoEmCentavos: product.precoEmCentavos,
          quantidade: 1,
        })
      );
    }
  };

  // Verifica se o produto está favoritado
  const isFavorited = favoritos.some((p) => p.id === product.id && p.isFavorited);

  return (
    <div className="flex flex-col">
      <div className="flex-grow max-w-4xl mx-auto p-6">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
          <img
            src={product.imagemUrl}
            alt={product.nome}
            className="w-full lg:w-1/2 h-auto object-cover rounded-lg shadow-md"
          />
          <div className="w-full lg:w-1/2">
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">{product.nome}</h1>
            <p className="text-gray-600 mb-6">{product.descricao}</p>
            <p className="text-2xl font-bold text-gray-800 mb-6">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(product.precoEmCentavos / 100)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 shadow-lg w-full flex justify-end pr-40 gap-4">
        <button
          className={`cursor-pointer ${
            isFavorited ? "text-red-500" : "text-gray-500"
          } px-6 py-2 rounded-full hover:text-red-600 transition-colors`}
          onClick={() => handleAddFavorite(product)}
        >
          {isFavorited ? (
            <MdFavorite size={30} />
          ) : (
            <MdOutlineFavoriteBorder size={30} />
          )}
        </button>
        <button
          className="cursor-pointer bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-colors"
          onClick={handleAddToCart}
        >
          Adicionar ao carrinho
        </button>
        <button className="cursor-pointer bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition-colors">
          Comprar agora
        </button>
      </div>
    </div>
  );
}
