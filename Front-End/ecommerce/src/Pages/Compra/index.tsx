import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../Redux/store";
import { clearCart } from "../../Redux/cartSlice";
import { useNavigate } from "react-router-dom";

const Compra: React.FC = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const totalPrice = cartItems.reduce((acc, item) => acc + item.precoEmCentavos * item.quantidade, 0);
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    paymentMethod: "credit_card",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Compra finalizada com sucesso!");
    dispatch(clearCart());
  };

  const finalizarCompra = async () => {
    const vendaDTO = {
      produtos: cartItems.map((item) => ({
        produtoId: item.id,
        quantidade: item.quantidade,
      })),
      cliente: formData.name,
      endereco: formData.address,
      metodoPagamento: formData.paymentMethod,
    };

    try {
      const response = await fetch("http://venda:8083/venda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vendaDTO),
      });

      if (!response.ok) throw new Error("Erro ao finalizar a compra");

      alert("Compra finalizada com sucesso!");
      dispatch(clearCart()); // Limpa o carrinho após a compra
      navigate("/sucesso"); // Redireciona para página de sucesso
    } catch (error) {
      alert("Erro ao processar a compra. Tente novamente.");
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
              <li key={item.id} className="flex justify-between border-b py-2">
                {item.nome} x {item.quantidade} - R$ {(item.precoEmCentavos / 100).toFixed(2)}
              </li>
            ))}
          </ul>
        )}
        <p className="text-lg font-bold mt-4">Total: R$ {(totalPrice / 100).toFixed(2)}</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Nome Completo"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="address"
          placeholder="Endereço de Entrega"
          value={formData.address}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <select
          name="paymentMethod"
          value={formData.paymentMethod}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="credit_card">Cartão de Crédito</option>
          <option value="pix">PIX</option>
          <option value="boleto">Boleto Bancário</option>
        </select>
        
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-700"
          onClick={finalizarCompra}
        >
          Confirmar Compra
        </button>
      </form>
    </div>
  );
};

export default Compra;
