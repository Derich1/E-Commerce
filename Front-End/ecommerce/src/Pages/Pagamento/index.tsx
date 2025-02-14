import React, { useEffect, useState } from "react";
import { CardNumber, ExpirationDate, initMercadoPago, SecurityCode } from "@mercadopago/sdk-react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "../../Redux/cartSlice";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../Redux/store";

initMercadoPago("TEST-7e414755-c026-434d-a4c7-7945e1158e4d"); // Chave de teste

const Pagamento: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // const produtos = useSelector((state: RootState) => state.cart.items);
  const [vendaId, setVendaId] = useState<string | null>(null);
  const [metodoPagamento, setMetodoPagamento] = useState("pix");
  const user = useSelector((state: RootState) => state.user.user)
  const [pixData, setPixData] = useState<{ qrCode: string; code: string } | null>(null);

  const [cardNumber, setCardNumber] = useState("");
  // const [cardExpiration, setCardExpiration] = useState("");
  // const [cardCVV, setCardCVV] = useState("");
  // const [cardHolderName, setCardHolderName] = useState("");
  const [installments, setInstallments] = useState(1);
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("CPF");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("vendaId");
    setVendaId(id);
  }, []);

  useEffect(() => {
    console.log("VendaId atualizado:", vendaId);
  }, [vendaId]);

  const gerarPix = async () => {
    try {
      const response = await axios.post(
        `http://localhost:8083/venda/${vendaId}/pagamento`,
        {
          metodoPagamento: "pix",
          nome,
          sobrenome,
          tipoDocumento,
          numeroDocumento,
          email: user?.email || "convidade@exemplo.com",
        }
      );
  
      setPixData({
        qrCode: response.data.pix_data.qr_code,
        code: response.data.pix_data.qr_code_base64,
      });
  
    } catch (error: any) {
      setError(error.response?.data?.error || "Erro ao gerar Pix");
    }
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!vendaId) throw new Error("Venda não encontrada");

      let requestData: any = {
        nome,
        sobrenome,
        tipoDocumento,
        numeroDocumento,
        metodoPagamento: metodoPagamento,
        email: user?.email || "convidade@exemplo.com",
      };

      // Fluxo para Cartões
      if (metodoPagamento !== "pix") {
        const tokenData = await (window as any).MercadoPago.createCardToken({
          cardholderName: `${nome} ${sobrenome}`,
          identificationType: tipoDocumento,
          identificationNumber: numeroDocumento,
        });

        requestData = {
          ...requestData,
          token: tokenData.id,
          installments: metodoPagamento === "credit_card" ? installments : 1
        };
      }

      const response = await axios.post(
        `http://localhost:8083/venda/${vendaId}/pagamento`,
        requestData
      );

      console.log(response.data)

      if (metodoPagamento === "pix") {
        setPixData({
          qrCode: response.data.pix_data.qr_code,
          code: response.data.pix_data.qr_code_base64
        });
      } else {
        if (response.data.status === "approved") {
          dispatch(clearCart());
          navigate("/sucesso");
        }
      }

    } catch (error: any) {
      setError(error.response?.data?.message || "Erro no pagamento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <div className="error-message">{error}</div>}
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

        <div>
            <label>Nome</label>
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
          </div>

          <div>
            <label>Sobrenome</label>
            <input type="text" value={sobrenome} onChange={(e) => setSobrenome(e.target.value)} required />
          </div>

          <div>
            <label>Tipo de Documento</label>
            <select value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value)}>
              <option value="CPF">CPF</option>
              <option value="CNPJ">CNPJ</option>
            </select>
          </div>

          <div>
            <label>Número do Documento</label>
            <input 
              type="text" 
              value={numeroDocumento} 
              onChange={(e) => setNumeroDocumento(e.target.value)} 
              required 
            />
          </div>

          {metodoPagamento === "pix" && (
          <div>
            {!pixData ? (
              <button 
                type="button" 
                onClick={gerarPix}
                disabled={loading}
              >
                {loading ? "Gerando QR Code..." : "Gerar Pix"}
              </button>
            ) : (
              <>
                <h3>Pagamento via Pix</h3>
                <img src={`data:image/png;base64,${pixData.code}`} alt="QR Code" />
                <input type="text" value={pixData.qrCode} readOnly />
                
                <button 
                  type="submit" 
                >
                  Já paguei
                </button>
              </>
            )}
          </div>
        )}

        {(metodoPagamento === "credit_card" || metodoPagamento === "debit_card") && (
          <>
            <div>
              <label>Número do Cartão</label>
              <CardNumber />
              <input type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} required />
            </div>
            <div>
              <label>Nome no Cartão</label>
            </div>
            <div>
              <label>Validade (MM/YY)</label>
              <ExpirationDate />
            </div>
            <div>
              <label>CVV</label>
              <SecurityCode />
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

        <button 
          type="submit" 
          disabled={loading}
          className="payment-button"
        >
          {loading ? "Processando..." : "Finalizar Pagamento"}
        </button>
      </form>
    </div>
  );
};

export default Pagamento;
