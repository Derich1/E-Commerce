import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom";
import { applyFilters, setProducts, updateSelectedCategory } from "../../Redux/productSlice";
import { RootState } from "../../Redux/store";
import { IoFilter } from "react-icons/io5";

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
    estoque: number;
    promotionalPrice?: number;
};

export default function Home() {

    const dispatch = useDispatch();
    const products = useSelector((state: RootState) => state.products.filteredProducts);
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const categorias = ["Todos", "Perfume", "Colônia", "Refil", "Sabonete", "Body Splash", "Sabonete Líquido", "Refil", "Creme"]
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    

    useEffect(() => {
        dispatch(applyFilters()); // Garante que os filtros são aplicados ao carregar
    }, [dispatch]);

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
    if (loading) {
        return( 
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            </div>)
    }
    if (error) return <p>Erro: {error}</p>;

    

    return(
        <main className="flex relative">
            <div className="sticky top-5 mt-2 left-2 h-0 z-40">
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="md:hidden absolute p-2 bg-blue-500 text-white rounded-lg shadow-lg"
                >
                    <IoFilter className="text-2xl" />
                </button>
            </div>
            {isMenuOpen && (
                <div
                onClick={() => setIsMenuOpen(false)}
                className="fixed inset-0 bg-black/50 md:hidden z-30"
                />
            )}
            <div
                className={`fixed md:relative md:w-30 md:top-5 lg:w-40 left-0 top-10 h-full bg-white shadow-lg md:shadow-none transform transition-transform duration-300 z-50 p-4 ${
                isMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                }`}
            >
            <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                <IoFilter /> Filtrar
            </h3>
            <ul className="space-y-2">
                {categorias.map((category) => (
                    <li 
                        key={category}
                        className="cursor-pointer block w-fit hover:underline p-0 m-2"
                        onClick={() => {
                            dispatch(updateSelectedCategory(category));
                            dispatch(applyFilters());
                            setIsMenuOpen(false);
                          }}
                    >
                        {category}
                    </li>
                ))}
            </ul>
        </div>

        <div className="flex-1 p-4 ml-8 md:ml-0 md:p-6 md:pl-2 lg:pl-4">
            <div className="max-w-screen-2xl mx-auto">
                {products.length === 0 ? (
                    <p className="text-center text-xl font-semibold text-red-500">Nenhum produto encontrado.</p>
                ) : (
                    <div className="w-full mx-auto px-4 sm:px-6 lg:px-0">
                        <ul className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5 justify-items-start w-full">
                        {products.map((product) => {
                            const now = new Date();
                            const promoStart = product.promotionStart ? new Date(product.promotionStart) : null;
                            const promoEnd = product.promotionEnd ? new Date(product.promotionEnd) : null;

                            const isPromoActive = promoStart && promoEnd
                                ? now >= promoStart && now <= promoEnd
                                : false;

                            // Cálculo da porcentagem de desconto
                            const discountPercentage = isPromoActive && product.promotionalPrice
                                ? Math.round(((product.precoEmCentavos - product.promotionalPrice) / product.precoEmCentavos) * 100)
                                : null;

                            return (
                                <li 
                                    key={product.id}
                                    className="w-full pb-2 border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-lg transition-all duration-300 relative"
                                >
                                    <Link to={`/produto/${product.id}`} className="block relative">
                                        <div className="relative">
                                            <img 
                                                src={product.imagemUrl} 
                                                alt={product.nome} 
                                                className="w-full h-48 object-contain mb-4"
                                            />
                                            {/* Badge de desconto */}
                                            {discountPercentage && (
                                                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                                    -{discountPercentage}%
                                                </div>
                                            )}
                                        </div>

                                        <h3 className="text-lg font-semibold text-center mb-2 line-clamp-2">{product.nome}</h3>

                                        {product.estoque > 0 ? (
                                            <div className="text-center">
                                                {isPromoActive && product.promotionalPrice ? (
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-gray-500 line-through text-sm">
                                                            {new Intl.NumberFormat("pt-BR", {
                                                                style: "currency",
                                                                currency: "BRL",
                                                            }).format(product.precoEmCentavos / 100)}
                                                        </span>
                                                        <span className="text-xl font-bold text-red-600">
                                                            {new Intl.NumberFormat("pt-BR", {
                                                                style: "currency",
                                                                currency: "BRL",
                                                            }).format(product.promotionalPrice / 100)}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <p className="text-xl font-bold text-gray-800">
                                                        {new Intl.NumberFormat("pt-BR", {
                                                            style: "currency",
                                                            currency: "BRL",
                                                        }).format(product.precoEmCentavos / 100)}
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-center text-red-600 text-xl font-bold">Esgotado</p>
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    </main>

    )
}