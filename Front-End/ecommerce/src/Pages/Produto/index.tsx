import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./index.css"
import {useDispatch} from "react-redux"
import { addItemToCart } from "../../Redux/cartSlice";

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
        
    

    return (
        <div className="product-detail">
            <img src={product.imagemUrl} alt={product.nome} className="product-image" />
            <div className="product-info">
                <h1>{product.nome}</h1>
                <p>{product.descricao}</p>
                <p className="product-price">
                {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                }).format(product.precoEmCentavos / 100)}
                </p>
                <div className="button-group">
                    <button className="btn-cart" onClick={handleAddToCart}>Adicionar ao carrinho</button>
                    <button className="btn-buy">Comprar agora</button>
                </div>
            </div>
        </div>
    );
}
