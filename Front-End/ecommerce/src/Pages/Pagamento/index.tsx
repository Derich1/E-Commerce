import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { postCredit } from "./postCredit"; // Função para processar cartão
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/store";
import { useNavigate } from "react-router-dom";
import PixPaymentForm from "./pix"; // Componente para PIX
import { loadMercadoPago } from "@mercadopago/sdk-js";
import axios from "axios";

declare global {
  interface Window {
    MercadoPago: any;
  }
}

const Pagamento: React.FC = () => {

  const transactionAmount = useSelector((state: RootState) => state.venda.total);
  const navigate = useNavigate();
  const cardFormRef = useRef<any>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedPaymentType, setSelectedPaymentType] = useState<"credit_card" | "debit_card" | "pix" | null>(null);
  const vendaId = useSelector((state: RootState) => state.venda.vendaId);
  const mercadoPagoTeste = import.meta.env.VITE_MERCADOPAGO;
  const fromPostalCode = "13210750"
  const toPostalCode = useSelector((state: RootState) => state.endereco.cep)
  const produtoId = useSelector((state: RootState) => state.venda.produtos.map(produto => produto.id))
  const [freteResult, setFreteResult] = useState(null);
  const produtos = useSelector((state: RootState) => state.venda.produtos)

  // Inicializa o cardForm apenas para crédito ou débito
  useLayoutEffect(() => {
    if (!selectedPaymentType || selectedPaymentType === "pix") return;
    const initCardForm = async () => {
      await loadMercadoPago();
      const mp = new window.MercadoPago(mercadoPagoTeste, { locale: "pt-BR" });

      if (cardFormRef.current) {
        console.log("Destruindo instância antiga...");
        cardFormRef.current.unmount();
        cardFormRef.current = null;
      }

      if (!formRef.current) return;

      cardFormRef.current = mp.cardForm({
        amount: transactionAmount.toString(),
        iframe: true,
        form: {
          id: formRef.current.id,
          cardNumber: { id: "form-checkout__cardNumber", placeholder: "Número do Cartão" },
          expirationDate: { id: "form-checkout__expirationDate", placeholder: "MM/AA" },
          securityCode: { id: "form-checkout__securityCode", placeholder: "Código de Segurança" },
          cardholderName: { id: "form-checkout__cardholderName", placeholder: "Nome do Titular" },
          issuer: { id: "form-checkout__issuer", placeholder: "Banco emissor" },
          installments: { id: "form-checkout__installments", placeholder: "Parcelas" },
          identificationType: { id: "form-checkout__identificationType", placeholder: "Tipo de Documento" },
          identificationNumber: { id: "form-checkout__identificationNumber", placeholder: "Número do Documento" },
          cardholderEmail: { id: "form-checkout__cardholderEmail", placeholder: "Email" },
        },
        callbacks: {
          onFormMounted: (error: any) => {
            if (error) return console.warn("Erro ao montar o formulário:", error);
            console.log("Formulário montado");
          },
          onSubmit: async (event: any) => {
            event.preventDefault();

            if (!selectedPaymentType) {
              alert("Por favor, selecione o tipo de pagamento: Crédito ou Débito.");
              return;
            }

            if (!cardFormRef.current) return;

            const cardFormData = cardFormRef.current.getCardFormData();
            if (!cardFormData || !cardFormData.paymentMethodId || !cardFormData.token) {
              console.warn("Dados do formulário incompletos");
              return;
            }

            const {
              paymentMethodId: payment_method_id,
              issuerId: issuer_id,
              cardholderEmail: email,
              token,
              installments,
              identificationNumber,
              identificationType,
            } = cardFormData;

            try {
              const response = await postCredit(
                token,
                issuer_id,
                payment_method_id,
                transactionAmount,
                Number(installments),
                email,
                identificationType,
                identificationNumber,
                selectedPaymentType,
                vendaId
              );
              console.log("Resposta recebida:", response.data);
              const status = response.data.status;
              console.log("Status recebido:", status);
              navigate(`/status/${status}`);
            } catch (error) {
              console.error("Erro no pagamento:", error);
            }
          },
          onFetching: (resource: any) => {
            console.log("Fetching resource:", resource);
            const progressBar = document.querySelector(".progress-bar");
            progressBar?.removeAttribute("value");
            return () => {
              progressBar?.setAttribute("value", "0");
            };
          },
        },
      });
    };

    initCardForm();
  }, [selectedPaymentType, transactionAmount, vendaId, mercadoPagoTeste, navigate]);


  useEffect(() => {
    const frete = async () => {

      const freteRequest = {
        produtoId,
        fromPostalCode,
        toPostalCode,
        produtos
      }
  
      try {
        const response = await axios.post(
          "http://localhost:8083/venda/calcularFrete",
          freteRequest
        );
        setFreteResult(response.data);
  
      } catch (error) {
        console.error("Erro ao calcular o frete:", error);
      }
    }

    frete()
  }, [])

  

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
      {/* Seletor de métodos de pagamento */}
      <div className="mb-4 text-center">
        <h2 className="text-xl font-semibold mb-4 mt-5">Selecione o tipo de pagamento:</h2>
        <div className="flex space-x-4">
          <button
            className={`px-4 py-2 rounded ${
              selectedPaymentType === "credit_card" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setSelectedPaymentType("credit_card")}
          >
            Cartão de Crédito
          </button>
          <button
            className={`px-4 py-2 rounded ${
              selectedPaymentType === "debit_card" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setSelectedPaymentType("debit_card")}
          >
            Cartão de Débito
          </button>
          <button
            className={`px-4 py-2 rounded ${
              selectedPaymentType === "pix" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setSelectedPaymentType("pix")}
          >
            Pix
          </button>
        </div>
      </div>

      {/* Renderiza o formulário de pagamento de acordo com o método selecionado */}
      {selectedPaymentType === "pix" ? (
        <>
          <PixPaymentForm />
          <p>{freteResult}</p>
        </>
      ) : (
        <>
          <form
            id="form-checkout"
            ref={formRef}
            className={`bg-white p-6 rounded-lg shadow-lg w-full max-w-md space-y-4 mt-6 ${
              selectedPaymentType ? "visible" : "invisible"
            }`}
          >
            <span>5031 4332 1540 6351</span>
            <div id="form-checkout__cardNumber" className="h-10 border p-2 rounded"></div>
            <div id="form-checkout__expirationDate" className="h-10 border p-2 rounded"></div>
            <div id="form-checkout__securityCode" className="h-10 border p-2 rounded"></div>
            <input type="text" id="form-checkout__cardholderName" className="w-full border p-2 rounded" />
            <select id="form-checkout__issuer" className="w-full border p-2 rounded"></select>
            <select
              id="form-checkout__installments"
              className={`w-full border p-2 rounded ${
                selectedPaymentType === "credit_card" ? "" : "hidden"
              }`}
            ></select>
            <select id="form-checkout__identificationType" className="w-full border p-2 rounded"></select>
            <input type="text" id="form-checkout__identificationNumber" className="w-full border p-2 rounded" />
            <input type="email" id="form-checkout__cardholderEmail" className="w-full border p-2 rounded" />

            <button
              type="submit"
              id="form-checkout__submit"
              className="w-full cursor-pointer bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
            >
              Pay
            </button>
            <progress value="0" className="w-full">Loading...</progress>
          </form>
          <p>{freteResult}</p>
        </>
      )}
    </div>
  );
};

export default Pagamento;
