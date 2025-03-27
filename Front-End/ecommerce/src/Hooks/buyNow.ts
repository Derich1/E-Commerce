import { useDispatch, useSelector } from "react-redux";
import { setImmediatePurchase } from "../Redux/vendaSlice";
import { useNavigate } from "react-router-dom";
import { RootState } from "../Redux/store";

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

  type ProdutoComprado = {
    id: string;
    nome: string;
    precoEmCentavos: number;
    quantidade: number;
    imagemUrl: string;
    width: number;
    height: number;
    length: number;
    weight: number;
  }

  export const useHandleBuyNow = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state: RootState) => state.user);

    const handleBuyNow = (product: Product) => {
        if (!user.user) {
            alert("Conecte-se a uma conta para prosseguir com a compra");
            navigate("/login");
            return;
        }

        const produtoComprado: ProdutoComprado = {
            id: product.id,
            quantidade: 1,
            nome: product.nome,
            precoEmCentavos: product.precoEmCentavos,
            imagemUrl: product.imagemUrl,
            width: product.width,
            height: product.height,
            length: product.length,
            weight: product.weight
        };

        dispatch(setImmediatePurchase(produtoComprado));
        navigate("/compra");
    };

    return handleBuyNow;
};