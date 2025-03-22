import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/store";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setPesoTotal, setPreferenceId, setTotal, setVendaId } from "../../Redux/vendaSlice";
import { setCep } from "../../Redux/enderecoSlice";
import { setFretes } from "../../Redux/freteSlice";

const Compra: React.FC = () => {
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const immediatePurchase = useSelector((state: RootState) => state.venda.immediatePurchase);
  const itemsToCheckout = immediatePurchase ? [immediatePurchase] : cartItems;
  const totalPrice = itemsToCheckout.reduce((acc, item) => acc + item.precoEmCentavos * item.quantidade, 0);
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user)
  const dispatch = useDispatch()
  const produtos = useSelector((state: RootState) => state.venda.produtos)
  

  const [formData, setFormData] = useState({
    address: "",
  });

  const [cepError, setCepError] = useState("");

  // Formatar CEP automaticamente (XXXXX-XXX)
  const formatCep = (cep: string) => {
    return cep
      .replace(/\D/g, "") // Remove caracteres não numéricos
      .replace(/^(\d{5})(\d)/, "$1-$2") // Adiciona o traço após os primeiros 5 dígitos
      .slice(0, 9); // Limita o tamanho máximo
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const formattedCep = formatCep(value);

    setFormData({ ...formData, [name]: formattedCep });

    if (formattedCep.length === 9) {
      validarCep(formattedCep)
      dispatch(setCep(formattedCep))
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
        setCepError(""); // Remove o erro se o CEP for válido
      }
    } catch (error) {
      setCepError("Erro ao validar CEP.");
    }
  };

  const finalizarCompra = async () => {
    // Validações iniciais
    if (cepError || formData.address.length < 9) return;
  
    if (!user.user) {
      alert("Conect-se a uma conta para poder prosseguir com a compra");
      return navigate("/login");
    }
  
    // Montagem dos dados
    const vendaDTO = {
      clienteId: user.user?.id,
      produtos: itemsToCheckout.map(item => ({
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
  
    const freteRequest = {
      toPostalCode: formData.address,
      products: produtos.map(p => ({
        id: p.id,
        width: p.width,
        height: p.height,
        length: p.length,
        weight: p.weight,
        precoEmCentavos: p.precoEmCentavos,
        quantidade: p.quantidade
      }))
    };
    

    console.log("Payload enviado para calcularFrete:", JSON.stringify(freteRequest, null, 2));
  
    try {
      // Chamada para criar a venda
      const { data: vendaResponse } = await axios.post(
        "http://localhost:8083/venda/criar",
        vendaDTO,
        { headers: { "Content-Type": "application/json" } }
      );
  
      // Armazenamento e dispatch dos dados da venda
      localStorage.setItem("vendaId", vendaResponse.id);
      const peso = vendaResponse.vendaPeso
      dispatch(setVendaId(vendaResponse.id));
      dispatch(setPreferenceId(vendaResponse.preferenceId));
      dispatch(setTotal(totalPrice / 100));
      dispatch(setPesoTotal(peso))
  
      const response = await axios.post(
        "http://localhost:8083/venda/calcularFrete",
        freteRequest,
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("Resposta do backend:", response.data);
      // Navega para a página de pagamento após a conclusão de tudo
      dispatch(setFretes(response.data))
      navigate("/pagamento");
    } catch (error: any) {
      setCepError("Erro ao processar a compra. Tente novamente.");
      console.error("Erro ao calcular frete:", error.response?.data || error.message);
    }
  };  

  return (
    <div className="mt-10 max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Finalizar Compra</h2>
      <div className="mb-6">
        <h3 className="text-xl font-semibold">Resumo do Pedido</h3>
        {itemsToCheckout.length === 0 ? (
          <p>Seu carrinho está vazio.</p>
        ) : (
          <ul>
            {itemsToCheckout.map((item) => (
              <li key={item.id || item.id} className="flex items-center gap-4 border-b pb-4">
                <img src={item.imagemUrl} alt={item.nome} className="w-20 h-20 object-cover rounded-lg shadow" />
                <div className="flex flex-col">
                  <p className="font-medium">{item.nome}</p>
                  <p className="text-gray-600">Quantidade: {item.quantidade}</p>
                  <p className="text-gray-800 font-semibold">
                    R$ {(item.precoEmCentavos / 100).toFixed(2)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="text-lg font-bold mt-4">Total: R$ {(totalPrice / 100).toFixed(2)}</p>
      </div>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          name="address"
          placeholder="Digite seu CEP"
          value={formData.address}
          onChange={handleChange}
          className={`w-full p-2 border rounded ${cepError ? "border-red-500" : "border-gray-300"}`}
          required
        />
        {cepError && <p className="text-sm text-red-500 mt-1">{cepError}</p>}

        <button
          type="button"
          className={"cursor-pointer w-full p-2 rounded text-white bg-blue-500 hover:bg-blue-700"}
          onClick={finalizarCompra}
        >
          Continuar Compra
        </button>
      </form>
    </div>
  );
};

export default Compra;
