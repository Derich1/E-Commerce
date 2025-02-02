import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {useDispatch} from "react-redux"
import { addItemToCart } from "../../Redux/cartSlice";
import { MdOutlineFavoriteBorder } from "react-icons/md";

type Product = {
    id: string;
    nome: string;
    precoEmCentavos: number;
    imagemUrl: string;
    marca: string;
    descricao: string;
};

export default function Produto() {

    const { id } = useParams(); // Obtém o id do produto a partir da URL
    const dispatch = useDispatch()

    // Estado para armazenar o produto
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProduct = async () => {
        try {
            const response = await axios.get<Product>(`http://localhost:8082/produto/${id}`);
            setProduct(response.data); // Armazena o produto individualmente
            setLoading(false);
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProduct(); // Chama a função para buscar o produto
    }, [id]); // Certifique-se de que a busca seja feita novamente se o id mudar

    // Exibição do componente
    if (loading) return <p>Carregando produto...</p>;
    if (error) return <p>Erro: {error}</p>;

    // Se o produto não for encontrado, você pode exibir uma mensagem de erro
    if (!product) return <p>Produto não encontrado.</p>;

    const handleAddToCart = () => {
        if (product) {
            dispatch(
              addItemToCart({
                id: product.id,
                nome: product.nome,
                precoEmCentavos: product.precoEmCentavos,
                quantidade: 1, // Adicionando uma unidade do produto
              })
            );
          }
    }
        
    

    function handleAddFavorite() {
        
    }

    return (
        <div className="flex flex-col">
            {/* Conteúdo principal */}
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
                    className="cursor-pointer bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-colors"
                    onClick={handleAddFavorite}
                >
                    <MdOutlineFavoriteBorder size={30}/>
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
