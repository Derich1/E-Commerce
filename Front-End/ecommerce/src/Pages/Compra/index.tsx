import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../Redux/store";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { setPesoTotal, setPreferenceId, setProdutos, setTotal, setVendaId } from "../../Redux/vendaSlice";
import { setCep } from "../../Redux/enderecoSlice";
import { setFretes } from "../../Redux/freteSlice";
import { useBoxPacking } from "../../Hooks/useBoxPacking";
import { setPackage } from "../../Redux/packageSlice";

interface Box {
  id: number;
  name: string;
  height: number; // em cm  
  width: number;  // em cm
  length: number; // em cm
}

interface ProductDimensions {
  id: string;
  nome: string;
  length: number;
  width: number;
  height: number;
  weight: number;
  quantity: number;
}

interface Package {
  boxId: number;
  boxNumber: number;
  height: number;
  width: number;
  length: number;
  weight: number;
  volume: number;
  products: {
    productName: string;
    quantity: number;
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    orientation: [number, number, number];
  }[];
}

const Compra: React.FC = () => {
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const immediatePurchase = useSelector((state: RootState) => state.venda.immediatePurchase);
  const itemsToCheckout = immediatePurchase ? [immediatePurchase] : cartItems;
  const totalPrice = itemsToCheckout.reduce((acc, item) => acc + item.precoEmCentavos * item.quantidade, 0);
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();

  const products: ProductDimensions[] = itemsToCheckout.map(item => ({
    id: item.id,
    nome: item.nome,
    length: item.length,
    width: item.width,
    height: item.height,
    weight: item.weight,
    quantity: item.quantidade
  }));

  const boxes: Box[] = [
    { id: 1, name: "Pequena", height: 6, width: 11, length: 16 },
    { id: 2, name: "Média", height: 20, width: 13, length: 6 },
    { id: 3, name: "Grande", height: 20, width: 14, length: 8 },
  ];

  const [packagingResult, setPackagingResult] = useState<Package | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { packProducts } = useBoxPacking(products, boxes);

  useEffect(() => {
    const calculatePackaging = () => {
      try {
        // packProducts retorna um PackagingResult (array de PackBox)
        const result = packProducts();
        if (result && result.length > 0) {
          // Como sempre haverá apenas um item, extraímos o primeiro
          const pack = result[0];
          const pkg: Package = {
            boxId: pack.box.id,
            boxNumber: 1, // Apenas um pacote
            height: pack.box.height,
            width: pack.box.width,
            length: pack.box.length,
            weight: pack.products.reduce(
              (acc, prod) => acc + prod.product.weight * prod.quantity,
              0
            ),
            volume: pack.box.height * pack.box.width * pack.box.length,
            products: pack.products.map((prod) => ({
              productName: prod.product.nome,
              quantity: prod.quantity,
              weight: prod.product.weight,
              dimensions: {
                length: prod.product.length,
                width: prod.product.width,
                height: prod.product.height,
              },
              orientation: prod.orientation,
            })),
          };
          setPackagingResult(pkg);
        } else {
          setPackagingResult(null);
        }
      } catch (err: any) {
        setError(err.message);
      }
    };

    calculatePackaging();
  }, []); // Se necessário, adicione dependências

  const [formData, setFormData] = useState({
    address: "",
  });

  const [cepError, setCepError] = useState("");

  // Função para formatar CEP automaticamente (XXXXX-XXX)
  const formatCep = (cep: string) => {
    return cep
      .replace(/\D/g, "")
      .replace(/^(\d{5})(\d)/, "$1-$2")
      .slice(0, 9);
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const formattedCep = formatCep(value);

    setFormData({ ...formData, [name]: formattedCep });

    if (formattedCep.length === 9) {
      validarCep(formattedCep);
      dispatch(setCep(formattedCep));
    } else {
      setCepError("Digite um CEP válido.");
    }
  };

  const validarCep = async (cep: string) => {
    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cep.replace("-", "")}/json/`);
      if (response.data.erro) {
        setCepError("CEP inválido.");
      } else {
        setCepError("");
      }
    } catch (error) {
      setCepError("Erro ao validar CEP.");
    }
  };

  const finalizarCompra = async () => {
    // Validações iniciais
    if (cepError || formData.address.length < 9) return;

    if (!user.user) {
      alert("Conecte-se a uma conta para prosseguir com a compra");
      return navigate("/login");
    }

    // Montagem dos dados para a venda
    const vendaDTO = {
      clienteId: user.user?.id,
      produtos: itemsToCheckout
        .filter(item => item.quantidade > 0)
        .map(item => ({
          produtoId: item.id,
          quantidade: item.quantidade,
          nome: item.nome,
          precoUnitario: item.precoEmCentavos / 100,
          imagemUrl: item.imagemUrl,
          weight: item.weight
        })),
      total: totalPrice / 100,
      status: "Pendente",
      metodoPagamento: "",
      statusPagamento: "Pendente",
      enderecoEntrega: formData.address,
      dataVenda: new Date().toISOString(),
      emailCliente: user.user?.email,
      statusEtiqueta: "Pendente"
    };

    try {
      // Criação da venda
      const { data: vendaResponse } = await axios.post(
        "http://localhost:8083/venda/criar",
        vendaDTO,
        { headers: { "Content-Type": "application/json" } }
      );

      const peso = vendaResponse.vendaPeso;
      dispatch(setVendaId(vendaResponse.id));
      dispatch(setProdutos(
        itemsToCheckout
          .filter(item => item.quantidade > 0)
          .map(item => ({
            produtoId: item.id,
            quantidade: item.quantidade,
            nome: item.nome,
            precoEmCentavos: item.precoEmCentavos,
            imagemUrl: item.imagemUrl,
            weight: item.weight
          }))
      ));
      dispatch(setPreferenceId(vendaResponse.preferenceId));
      dispatch(setTotal(totalPrice / 100));
      dispatch(setPesoTotal(peso));

      // Validação do empacotamento
      if (!packagingResult) {
        alert("Erro no cálculo de empacotamento!\nVerifique o console para detalhes.");
        return;
      }

      // Envia o pacote único para o Redux e para o payload do frete
      dispatch(setPackage(packagingResult));

      const freteRequest = {
        toPostalCode: formData.address,
        pacote: packagingResult, // Objeto único
        totalWeight: peso
      };

      const response = await axios.post(
        "http://localhost:8083/venda/calcularFrete",
        freteRequest,
        { headers: { "Content-Type": "application/json" } }
      );
      dispatch(setFretes(response.data));
      navigate("/pagamento");
    } catch (error: any) {
      setCepError("Erro ao processar a compra. Tente novamente.");
      console.error("Erro ao calcular frete:", error.response?.data || error.message);
    }
  };

  if (error) {
    return (
      <div className="p-4 text-red-600 text-center flex flex-col bg-red-100 rounded-lg max-w-md mx-auto mt-8">
        ❌ Erro: {error}
        <button 
          onClick={() => window.history.back()}
          className="mt-4 bg-gray-200 cursor-pointer hover:bg-gray-300 px-4 py-2 rounded"
        >
          Voltar ao Carrinho
        </button>
      </div>
    );
  }

  return (
    <div className="mt-10 max-w-4xl mx-auto p-4 md:p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Finalizar Compra</h2>
      
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Resumo do Pedido</h3>
        
        {itemsToCheckout.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Seu carrinho está vazio</p>
          </div>
        ) : (
          <div className="space-y-4">
            {itemsToCheckout.map((item) => (
              <div 
                key={item.id} 
                className="flex flex-col sm:flex-row items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100"
              >
                <img 
                  src={item.imagemUrl} 
                  alt={item.nome} 
                  className="w-full sm:w-24 h-24 object-cover rounded-lg shadow-sm" 
                />
                <div className="flex-1 w-full">
                  <p className="font-medium text-gray-800 mb-1">{item.nome}</p>
                  <div className="flex flex-wrap gap-4 justify-between">
                    <p className="text-sm text-gray-600">
                      Quantidade: <span className="font-medium">{item.quantidade}</span>
                    </p>
                    <p className="text-base font-semibold text-blue-600">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(item.precoEmCentavos / 100)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-700">Total:</span>
                <span className="text-2xl font-bold text-green-600">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(totalPrice / 100)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label htmlFor="cep" className="block text-sm font-medium text-gray-700 mb-2">
            CEP
          </label>
          <div className="relative">
            <input
              type="text"
              id="cep"
              name="address"
              placeholder="Ex: 00000-000"
              value={formData.address}
              onChange={handleChange}
              className={`w-full px-4 py-3 border ${
                cepError ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
              required
            />
            {cepError && (
              <div className="absolute inset-y-0 right-3 flex items-center pr-3 pointer-events-none">
                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          {cepError && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {cepError}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={finalizarCompra}
          className="w-full cursor-pointer md:w-auto px-8 py-3.5 text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50"
        >
          Continuar Compra
        </button>
      </form>
    </div>
  );
};

export default Compra;
