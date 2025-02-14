import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/store";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setPreferenceId } from "../../Redux/vendaSlice";

const Compra: React.FC = () => {
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const totalPrice = cartItems.reduce((acc, item) => acc + item.precoEmCentavos * item.quantidade, 0);
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user)
  const dispatch = useDispatch()

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
      validarCep(formattedCep);
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
    if (cepError || formData.address.length < 9) {
      return;
    }

    console.log(cartItems)

    const vendaDTO = {
      clienteId: user.user?.id,
      produtos: cartItems.map(item => ({
        produtoId: item.id,
        quantidade: item.quantidade,
        nome: item.nome, // Nome do produto
        precoUnitario: item.precoEmCentavos / 100, // Preço do produto
      })),
      total: totalPrice,
      status: "Pendente",
      metodoPagamento: "",
      statusPagamento: "Pendente",
      enderecoEntrega: formData.address,
      dataVenda: new Date().toISOString(),
      emailCliente: user.user?.email
    };
    console.log("Payload enviado:", JSON.stringify(vendaDTO, null, 2));

    try {
      const response = await axios.post("http://localhost:8083/venda/criar", vendaDTO, {
        headers: { "Content-Type": "application/json" },
      });

      const vendaId = response.data.id;
      localStorage.setItem("vendaId", vendaId);
      dispatch(setPreferenceId(response.data.preferenceId))
      navigate("/pagamento");
    } catch (error) {
      setCepError("Erro ao processar a compra. Tente novamente.");
      console.error(error);
    }
  };

  return (
    <div className="mt-10 max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Finalizar Compra</h2>
      <div className="mb-6">
        <h3 className="text-xl font-semibold">Resumo do Pedido</h3>
        {cartItems.length === 0 ? (
          <p>Seu carrinho está vazio.</p>
        ) : (
          <ul>
            {cartItems.map((item) => (
              <li key={item.id} className="flex items-center gap-4 border-b pb-4">
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

      <form className="space-y-4">
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
