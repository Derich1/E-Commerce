import React, { useEffect, useState } from "react";
import { initMercadoPago } from "@mercadopago/sdk-react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "../../Redux/cartSlice";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../Redux/store";

initMercadoPago("TEST-7e414755-c026-434d-a4c7-7945e1158e4d"); // Chave de teste

const Pagamento: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const produtos = useSelector((state: RootState) => state.cart.items);
  const [vendaId, setVendaId] = useState<string | null>(null);
  const [metodoPagamento, setMetodoPagamento] = useState("pix");
  const user = useSelector((state: RootState) => state.user.user)
  
  // Dados do cartão (se necessário)
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiration, setCardExpiration] = useState("");
  const [cardCVV, setCardCVV] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [installments, setInstallments] = useState(1);

  useEffect(() => {
    const id = localStorage.getItem("vendaId");
    setVendaId(id);
  }, []);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vendaId) {
      console.error("Venda ID não encontrado");
      return;
    }

    try {
      let token = null;

      // Se for crédito ou débito, precisa gerar o token do cartão
      if (metodoPagamento !== "pix") {
        const { id } = await (window as any).MercadoPago.createCardToken({
          cardNumber,
          cardExpirationMonth: cardExpiration.split("/")[0],
          cardExpirationYear: "20" + cardExpiration.split("/")[1],
          securityCode: cardCVV,
          cardholderName: cardHolderName,
          identificationType: "CPF",
          identificationNumber: "12345678909",
        });

        token = id;
        console.log("Token gerado:", token);
      }

      const transactionAmount = produtos.reduce(
        (acc, produto) => acc + produto.precoEmCentavos * produto.quantidade,
        0
      ) / 100;

      const response = await axios.post(`http://localhost:8083/venda/${vendaId}/pagamento`, {
        token,
        paymentMethodId: metodoPagamento,
        installments: metodoPagamento === "credit_card" ? installments : 1,
        transactionAmount,
        description: "Compra no meu site",
        email: user?.email, // Caso ele entre no site sem precisar logar o email estará vazio pq no momento do login q ele salva.
        metodoPagamento: metodoPagamento
      });

      if (response.data.status === "approved") {
        dispatch(clearCart());
        navigate("/sucesso");
      } else {
        console.error("Pagamento recusado:", response.data);
      }
    } catch (error) {
      console.error("Erro no pagamento:", error);
    }
  };

  return (
    <div>
      <h2>Pagamento</h2>
      <form onSubmit={handlePayment}>
        <div>
          <label>Escolha o método de pagamento:</label>
          <select value={metodoPagamento} onChange={(e) => setMetodoPagamento(e.target.value)}>
            <option value="pix">Pix</option>
            <option value="credit_card">Cartão de Crédito</option>
            <option value="debit_card">Cartão de Débito</option>
          </select>
        </div>

        {(metodoPagamento === "credit_card" || metodoPagamento === "debit_card") && (
          <>
            <div>
              <label>Número do Cartão</label>
              <input type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} required />
            </div>
            <div>
              <label>Nome no Cartão</label>
              <input type="text" value={cardHolderName} onChange={(e) => setCardHolderName(e.target.value)} required />
            </div>
            <div>
              <label>Validade (MM/YY)</label>
              <input type="text" value={cardExpiration} onChange={(e) => setCardExpiration(e.target.value)} required />
            </div>
            <div>
              <label>CVV</label>
              <input type="text" value={cardCVV} onChange={(e) => setCardCVV(e.target.value)} required />
            </div>

            {metodoPagamento === "credit_card" && (
              <div>
                <label>Parcelas</label>
                <select value={installments} onChange={(e) => setInstallments(Number(e.target.value))}>
                  <option value={1}>1x</option>
                  <option value={2}>2x</option>
                  <option value={3}>3x</option>
                  <option value={4}>4x</option>
                </select>
              </div>
            )}
          </>
        )}

        <button type="submit">Pagar</button>
      </form>
    </div>
  );
};

export default Pagamento;
