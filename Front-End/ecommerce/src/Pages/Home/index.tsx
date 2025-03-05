import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom";
import { setProducts } from "../../Redux/productSlice";
import { RootState } from "../../Redux/store";
import FilterModal from "../../Components/FilterModal";

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
    const categorias = ["Todos", "Perfumes", "Desodorantes", "Colônias", "Lábios"]

    console.log("Chave MercadoPago:", import.meta.env.VITE_MERCADOPAGO);

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
    if (loading) return <p className="text-center text-3xl mt-20">Carregando produtos...</p>;
    if (error) return <p>Erro: {error}</p>;

    return(
        <main className="flex-grow">
        <FilterModal categories={categorias}/>
        <div className="max-w-7xl mx-auto p-6">
            {products.length === 0 ? (
                <p className="text-center text-xl font-semibold text-red-500">Nenhum produto encontrado.</p>
        
            ) : (
                <ul className="ml-[10%] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                    <li key={product.id} className="border border-gray-300 rounded-lg overflow-hidden bg-white hover:shadow-lg hover:transform hover:translate-y-1 transition-all duration-300">
                        <Link to={`/produto/${product.id}`} className="">
                            <img src={product.imagemUrl} className="w-full h-48 object-cover mb-4 rounded-md"/>
                            <h3 className="text-lg font-semibold text-center mb-2">{product.nome}</h3>
                            <p className="text-center text-xl font-bold text-gray-800">
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
        </main>
    )
}