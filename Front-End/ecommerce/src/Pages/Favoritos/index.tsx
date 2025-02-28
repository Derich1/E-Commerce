import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux";
import { addItemToCart } from "../../Redux/cartSlice";
import { useNavigate } from "react-router-dom";

interface Product {
  id: string;
  nome: string;
  precoEmCentavos: number;
  imagemUrl: string;
  isFavorited?: boolean;
}

const Favoritos = () => {
  const [favoritos, setFavoritos] = useState<Product[]>(() => {
    const storedFavoritos = localStorage.getItem("favoritos");
    return storedFavoritos ? JSON.parse(storedFavoritos) : [];
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const token = localStorage.getItem("token");
  let email = "";

  const handleBuyNow = (product: Product) => {
    handleAddToCart(product);
    navigate("/compra");
  };

  if (token) {
    const decoded: any = jwtDecode(token);
    email = decoded.sub;
  }

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
    dispatch(
      addItemToCart({
        id: product.id,
        nome: product.nome,
        precoEmCentavos: product.precoEmCentavos,
        quantidade: 1,
        imagemUrl: product.imagemUrl
      })
    );
  };

  return (
    <div>
      <h2 className="text-center text-3xl mt-10">Meus Favoritos</h2>
      {loading ? <p>Carregando...</p> : null}
      {error ? <p>{error}</p> : null}

      {!loading && !error && favoritos.length === 0 ? (
      <p className="text-center text-2xl my-auto text-gray-600 mt-6">
        Você ainda não tem nenhum produto favorito.
      </p>
       ) : (
        <ul className="space-y-4">
        {favoritos.map((product) => (
          <li
            key={product.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <img
                src={product.imagemUrl}
                alt={product.nome}
                className="w-16 h-16 object-cover rounded-md"
              />
              <span className="text-lg font-medium text-gray-800">
                {product.nome} -{" "}
                <span className="text-green-500">
                  R$ {(product.precoEmCentavos / 100).toFixed(2)}
                </span>
              </span>
            </div>
            <div className="flex space-x-2"> {/* Aqui, usei flex e o space-x-2 */}
                <button
                onClick={() => handleToggleFavorite(product)}
                className="cursor-pointer bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-colors"
                >
                Remover Favorito
                </button>
                <button
                className="cursor-pointer bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-colors"
                onClick={() => handleAddToCart(product)}
                >
                Adicionar ao carrinho
                </button>
                <button onClick={() => handleBuyNow(product)} className="cursor-pointer bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition-colors">
                Comprar agora
                </button>
            </div>
          </li>
        ))}
      </ul>
       )} 
    </div>
  )
}

export default Favoritos;
