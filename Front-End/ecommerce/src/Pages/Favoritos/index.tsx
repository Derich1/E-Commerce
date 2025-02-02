import React, { useEffect, useState } from "react";
import axios from "axios";
import { MdOutlineFavoriteBorder, MdFavorite } from "react-icons/md";

type Product = {
  id: string;
  nome: string;
  precoEmCentavos: number;
  imagemUrl: string;
  marca: string;
  descricao: string;
  isFavorited: boolean; // Novo campo para marcar se o produto está favoritado
};

const Favoritos: React.FC = () => {
  const [favoritos, setFavoritos] = useState<Product[]>([]); // Lista de produtos favoritados
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const token = localStorage.getItem("token");

  // Função para buscar os produtos favoritados
  const fetchFavoritos = async () => {
    if (token) {
      try {
        const response = await axios.get<Product[]>(`http://localhost:8081/cliente/favoritos`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Adiciona o campo isFavorited diretamente
        const produtos = response.data.map(product => ({
          ...product,
          isFavorited: true,  // Marca todos os produtos retornados como favoritados
        }));
        setFavoritos(produtos);
        setLoading(false);
      } catch (err) {
        setError("Erro ao buscar favoritos");
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchFavoritos(); // Buscar favoritos ao carregar a página
  }, [token]); // Recarregar se o token mudar

  const handleToggleFavorite = async (product: Product) => {
    if (token) {
      try {
        // Alterna o estado de favoritado
        if (product.isFavorited) {
          // Remove do favorito
          await axios.delete(`http://localhost:8081/cliente/favorito/${product.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        } else {
          // Adiciona aos favoritos
          await axios.post(
            "http://localhost:8081/cliente/favorito", 
            { productId: product.id },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }

        // Atualiza o estado localmente
        setFavoritos(favoritos.map(p => 
          p.id === product.id ? { ...p, isFavorited: !p.isFavorited } : p
        ));
      } catch (err) {
        console.error("Erro ao alterar favorito:", err);
      }
    }
  };

  if (loading) return <p>Carregando favoritos...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="flex flex-col">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Meus Favoritos</h1>

        {favoritos.length === 0 ? (
          <p className="text-center text-gray-500">Você ainda não tem favoritos.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoritos.map((product) => (
              <div key={product.id} className="border p-4 rounded-lg shadow-md">
                <img
                  src={product.imagemUrl}
                  alt={product.nome}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
                <h2 className="text-xl font-semibold text-gray-800 mb-2">{product.nome}</h2>
                <p className="text-gray-600 mb-2">{product.descricao}</p>
                <p className="text-lg font-bold text-gray-800">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(product.precoEmCentavos / 100)}
                </p>

                <button
                  className="mt-4 text-red-500"
                  onClick={() => handleToggleFavorite(product)}
                >
                  {product.isFavorited ? (
                    <MdFavorite size={30} />
                  ) : (
                    <MdOutlineFavoriteBorder size={30} />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favoritos;
