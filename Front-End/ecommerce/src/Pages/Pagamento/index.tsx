import { loadMercadoPago } from "@mercadopago/sdk-js";
import { useEffect, useRef } from "react";
import { postCredit } from "./postCredit";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/store";
import { useNavigate } from "react-router-dom";

declare global {
  interface Window {
    MercadoPago: any;
  }
}

const Pagamento: React.FC = () => {

  const transactionAmount = useSelector((state: RootState) => state.venda.total)
  const navigate = useNavigate()
  const cardFormRef = useRef<any>(null);

  const mercadoPagoTeste = import.meta.env.VITE_MERCADOPAGO


  useEffect(() => {
    const initCardForm = async () => {
      await loadMercadoPago();
      const mp = new window.MercadoPago(mercadoPagoTeste);
  
      // Se já existir uma instância, destrua antes de criar outra
      if (cardFormRef.current) {
        console.log("Destruindo instância antiga...");
        cardFormRef.current.destroy();
        cardFormRef.current = null;
      }
  
      // Agora cria uma nova instância corretamente
      cardFormRef.current = mp.cardForm({
        amount: transactionAmount.toString(),
        iframe: true,
        form: {
          id: "form-checkout",
          cardNumber: { id: "form-checkout__cardNumber", placeholder: "Card Number" },
          expirationDate: { id: "form-checkout__expirationDate", placeholder: "MM/YY" },
          securityCode: { id: "form-checkout__securityCode", placeholder: "Security Code" },
          cardholderName: { id: "form-checkout__cardholderName", placeholder: "Cardholder" },
          issuer: { id: "form-checkout__issuer", placeholder: "Issuing bank" },
          installments: { id: "form-checkout__installments", placeholder: "Installments" },
          identificationType: { id: "form-checkout__identificationType", placeholder: "Document type" },
          identificationNumber: { id: "form-checkout__identificationNumber", placeholder: "Document number" },
          cardholderEmail: { id: "form-checkout__cardholderEmail", placeholder: "Email" },
        },
  
        callbacks: {
          onFormMounted: (error: any) => {
            if (error) return console.warn("Erro ao montar o formulário: ", error);
            console.log("Formulário montado");
          },
          onSubmit: async (event: any) => {
            event.preventDefault();
  
            // Verifica se a instância do formulário ainda existe antes de acessar os dados
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
                identificationNumber
              );
  
              const status = response.data.status;
              console.log("Status recebido: ", status);
              navigate(`/status/${status}`);
            } catch (error) {
              console.error("Erro no pagamento:", error);
            }
          },
          onFetching: (resource: any) => {
            console.log("Fetching resource: ", resource);
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
  
    return () => {
      if (cardFormRef.current) {
        console.log("Destruindo instância ao desmontar...");
        cardFormRef.current.unmount();
        cardFormRef.current = null;
      }
    };
  }, []);
  

  return (
    <>
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form id="form-checkout" className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md space-y-4">
        <span>5031 4332 1540 6351</span>
        <div id="form-checkout__cardNumber" className="h-10 border p-2 rounded"></div>
        <div id="form-checkout__expirationDate" className="h-10 border p-2 rounded"></div>
        <div id="form-checkout__securityCode" className="h-10 border p-2 rounded"></div>
        <input type="text" id="form-checkout__cardholderName" className="w-full border p-2 rounded" />
        <select id="form-checkout__issuer" className="w-full border p-2 rounded"></select>
        <select id="form-checkout__installments" className="w-full border p-2 rounded"></select>
        <select id="form-checkout__identificationType" className="w-full border p-2 rounded"></select>
        <input type="text" id="form-checkout__identificationNumber" className="w-full border p-2 rounded" />
        <input type="email" id="form-checkout__cardholderEmail" className="w-full border p-2 rounded" />

        <button type="submit" id="form-checkout__submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition">
          Pay
        </button>
        <progress value="0" className="w-full">Loading...</progress>
      </form>
      </div>
    </>
  );
};

export default Pagamento;
