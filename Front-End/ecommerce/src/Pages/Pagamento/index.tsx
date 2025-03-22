import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { postCredit } from "./postCredit"; // Função para processar cartão
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/store";
import { useNavigate } from "react-router-dom";
import PixPaymentForm from "./pix"; // Componente para PIX
import { loadMercadoPago } from "@mercadopago/sdk-js";
import { setFreteSelecionado } from "../../Redux/freteSlice";
import { useDispatch } from "react-redux";
import axios from "axios";

declare global {
  interface Window {
    MercadoPago: any;
  }
}

interface Box {
  id: number;
  name: string;
  height: number; // em cm
  width: number;  // em cm
  length: number; // em cm
}

const Pagamento: React.FC = () => {

  const boxes: Box[] = [
    { id: 1, name: "Pequena", height: 10, width: 15, length: 20 },
    { id: 2, name: "Média", height: 20, width: 30, length: 40 },
    { id: 3, name: "Grande", height: 30, width: 40, length: 50 },
  ];

  const navigate = useNavigate();
  const cardFormRef = useRef<any>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedPaymentType, setSelectedPaymentType] = useState<"credit_card" | "debit_card" | "pix" | null>(null);
  const vendaId = useSelector((state: RootState) => state.venda.vendaId);
  const mercadoPagoTeste = import.meta.env.VITE_MERCADOPAGO;
  const fretes = useSelector((state: RootState) => state.frete.fretes).filter(frete => !frete.error);
  const freteSelecionado = useSelector((state: RootState) => state.frete.freteSelecionado);
  const dispatch = useDispatch()  
  const cep = useSelector((state: RootState) => state.endereco.cep)
  const usuario = useSelector((state: RootState) => state.user.user)
  const totalVenda = Number(useSelector((state: RootState) => state.venda.total) || 0)
  const produtos = useSelector((state: RootState) => state.venda.produtos)
  const valorFrete = Number(freteSelecionado?.price) || 0
  const totalComFrete = Math.round((totalVenda + valorFrete) * 100) / 100; 
  // .map(p => p.weight * p.quantidade) Cria um array com o peso total de cada item (quantidade × peso unitário)
  // .reduce((acc, peso) => acc + peso, 0) Soma todos os valores do array gerado pelo map
  const pesoTotal = useSelector((state: RootState) => 
    state.venda.produtos
      .map(p => p.weight * p.quantidade)
      .reduce((acc, peso) => acc + peso, 0)
  );
  
  const selecionarFrete = (frete: any) => {
    dispatch(setFreteSelecionado(frete));
  };

  const [formData, setFormData] = useState({
    toAddress: "",
    toCity: "",
    toNumber: "",
    toDistrict: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  useEffect(() => {
    console.log("Estado atualizado:", formData);
  }, [formData]);

  // Inicializa o cardForm apenas para crédito ou débito
  useLayoutEffect(() => {

    let isMounted = true;

    if (!selectedPaymentType || selectedPaymentType === "pix") return;

    const initCardForm = async () => {

      if (cardFormRef.current) {
        console.log("Destruindo instância antiga...");
        cardFormRef.current.unmount();
        cardFormRef.current = null;
      }

      if (!window.MercadoPago) {
        await loadMercadoPago();
      }

      const mp = new window.MercadoPago(mercadoPagoTeste, { locale: "pt-BR" });

      if (!isMounted || !formRef.current) return;

      console.log(totalComFrete)

      cardFormRef.current = mp.cardForm({
        amount: totalComFrete.toString(),
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
          onSubmit: async (event: React.FormEvent) => {
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

            console.log("Total Calculado:", totalComFrete.toFixed(2)); // Deve mostrar 2 casas

            const {
              paymentMethodId: payment_method_id,
              issuerId: issuer_id,
              cardholderEmail: email,
              token,
              installments,
              identificationType,
              identificationNumber, // valor do cardForm
            } = cardFormData;

            try {
              const response = await postCredit(
                token,
                issuer_id,
                payment_method_id,
                totalComFrete,
                Number(installments),
                email,
                identificationType,
                identificationNumber,
                selectedPaymentType,
                vendaId,
              );
              console.log("Resposta recebida:", response.data);
              const status = response.data.status;
              console.log("Status recebido:", status);

              const entregaRequest = {
                toPostalCode: cep,
                toName: usuario?.nome,
                toAddress: formData.toAddress,
                toCity: formData.toCity,
                toDocument: usuario?.numeroDocumento,
                toNumber: formData.toNumber,
                toDistrict: formData.toDistrict,
                receipt: true,
                ownHand: false,
                reverse: false,
                nonCommercial: false,     
                insuranceValue: totalVenda,
                service: freteSelecionado?.id,
                productName: produtos.map(p => p.nome),
                productQuantity: produtos.map(p => p.quantidade),
                productUnitaryValue: produtos.map(p => p.precoEmCentavos),
                volumeHeight: boxes.find(b => b.id == 1)?.height,
                volumeWidth: boxes.find(b => b.id == 1)?.width,
                volumeLength: boxes.find(b => b.id == 1)?.length,
                volumeWeight: pesoTotal,
                vendaId: vendaId
              };
              console.log("Enviando para o backend: " + entregaRequest)
          
              await axios.post("http://localhost:8083/venda/inserirFrete", entregaRequest)

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

    return () => {
      isMounted = false;
      
      // 7. Destruir instâncias ao desmontar
      if (cardFormRef.current) {
        console.log("Limpando instância...");
        cardFormRef.current.unmount();
        cardFormRef.current = null;
      }
    }
  }, [selectedPaymentType, totalComFrete, vendaId, mercadoPagoTeste, navigate]);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
      {/* Seletor de métodos de pagamento */}
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl px-4 mt-10 items-start">
        <div className="flex-1">
          <h2 className="text-xl text-center mb-2">Endereço de entrega</h2>
          <form className="space-y-4 bg-white p-6 rounded-lg shadow-lg">
            <input
              type="text"
              name="toAddress"
              placeholder="Endereço"
              value={formData.toAddress}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              name="toNumber"
              placeholder="Número"
              value={formData.toNumber}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              name="toDistrict"
              placeholder="Bairro"
              value={formData.toDistrict}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              name="toCity"
              placeholder="Cidade"
              value={formData.toCity}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </form>
        </div>

        <div className="flex-1 flex flex-col items-center">
          <h2 className="text-xl text-center mb-2">Opções de Frete</h2>
          <ul className="space-y-2 max-w-60">
            {fretes.map((frete) => (
              <li key={frete.id} onClick={() => selecionarFrete(frete)}
                className={`
                  p-4 mb-2 cursor-pointer rounded-lg w-full
                  ${freteSelecionado?.id === frete.id ? 'bg-green-100 border-2 border-green-500' : 'bg-white border border-gray-300'}
                  hover:bg-gray-100 transition-colors
                `}>
                  <div className="flex items-center">
                    <img src={frete.company.picture} alt={frete.company.name} className="w-12 h-12 mr-4 object-contain" />
                    <div> 
                      <p className="font-bold text-lg">{frete.name}</p>
                      <p className="text-gray-500">R$ {frete.price}</p>
                      {frete.delivery_range && frete.delivery_range.min && frete.delivery_range.max && (
                        <p className="text-sm text-gray-700 mt-2">
                          Estimativa de entrega: {frete.delivery_range.min} - {frete.delivery_range.max} dias
                        </p>
                      )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
      </div>
      </div>

      <div className="text-center mt-8">
        <h2 className="text-xl font-semibold mb-4 mt-5">Selecione o tipo de pagamento:</h2>
        <div className="flex justify-center space-x-4">
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
          <PixPaymentForm />
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
              Pagar
            </button>
            <progress value="0" className="w-full">Carregando...</progress>
          </form>
        </>
      )}
    </div>
  );
};

export default Pagamento;
