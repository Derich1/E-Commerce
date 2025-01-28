import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux"
import "./index.css"
import { Link } from "react-router-dom";
import { setProducts } from "../../Redux/productSlice";
import { RootState } from "../../Redux/store";

type Product = {
    id: string;
    nome: string;
    precoEmCentavos: number;
    imagemUrl: string;
    marca: string;
    categoria: string;
}

export default function Home() {

    const dispatch = useDispatch();
    const products = useSelector((state: RootState) => state.products.filteredProducts);
  
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    const fetchProducts = async () => {
        try {
          const response = await axios.get<Product[]>("http://localhost:8082/produto");
          dispatch(setProducts(response.data))
          setLoading(false);
        } catch (err: any) {
          setError(err.message || "Erro ao buscar produtos");
          setLoading(false);
        }
    }
    
    // useEffect para carregar os produtos ao montar o componente
    useEffect(() => {
        fetchProducts();
    }, []);
    
    // Exibição do componente
    if (loading) return <p>Carregando produtos...</p>;
    if (error) return <p>Erro: {error}</p>;

    return(
        <div className="product-list">
            {products.length === 0 ? (
                <p>Nenhum produto encontrado.</p>
            ) : (
                <ul>
                {products.map((product) => (
                    <li key={product.id}>
                        <Link to={`/produto/${product.id}`} className="product-item-link">
                            <h3>{product.nome}</h3>
                            <img src={product.imagemUrl} />
                            <p>
                            {" "}
                            {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                            }).format(product.precoEmCentavos / 100)}
                            </p>
                        </Link>
                    </li>
                ))}
                </ul>
            )}
        </div>
    )
}