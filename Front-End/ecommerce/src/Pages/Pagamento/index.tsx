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
import InputMask from "react-input-mask";

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

// Logradouro é Rua
interface Endereco {
  cep: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  estado: string;
  numero: string;
  complemento?: string;
}

const Pagamento: React.FC = () => {

  const boxes: Box[] = [
    { id: 1, name: "Pequena", height: 10, width: 15, length: 20 },
    { id: 2, name: "Média", height: 20, width: 30, length: 40 },
    { id: 3, name: "Grande", height: 30, width: 40, length: 50 },
  ];

  const [endereco, setEndereco] = useState<Endereco>({
    cep: "",
    logradouro: "",
    bairro: "",
    cidade: "",
    estado: "",
    numero: "",
    complemento: ""
  });

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
  const produtos = useSelector((state: RootState) => state.venda.produtos)
  const totalVenda = Number(useSelector((state: RootState) => state.venda.total) || 0)
  const valorFrete = Number(freteSelecionado?.price) || 0
  const totalComFrete = Math.round((totalVenda + valorFrete) * 100) / 100; 
  const pesoTotal = useSelector((state: RootState) => state.venda.totalPeso);
  const [loading, setLoading] = useState<boolean>(true);
  const [maskedValue, setMaskedValue] = useState("");
  const [cleanValue, setCleanValue] = useState("");
  const [mask, setMask] = useState("999.999.999-99"); // Começa com a máscara de CPF
  const [cleanValueType, setCleanValueType] = useState("")

  // O mercadopago pega o valor diretamente da DOM, para enviar sem formatacao 
  // e com o usuario visualizando ele formatado eu escolhi criar um input invisivel para o mercadopago 
  // e outro visivel para que o usuario veja com uma melhor ux.
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove tudo que não for número

    setMaskedValue(value);
    setCleanValue(value); // Salva o número limpo para envio
  };

  const handleIdentificationTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value; // Ex: "CPF" ou "CNPJ"
    setCleanValueType(type);
    if (type === "CNPJ") {
      setMask("99.999.999/9999-99");
    } else {
      setMask("999.999.999-99");
    }
    // Reseta os campos do input quando o tipo é alterado
    setMaskedValue("");
    setCleanValue("");
  };

  const updateMask = () => {
    setMask(cleanValueType === "CNPJ" ? "99.999.999/9999-99" : "999.999.999-99");
    setMaskedValue(""); // Reseta o campo ao trocar a máscara
    setCleanValue(""); // Limpa o valor salvo
  };

  useEffect(() => {
    updateMask(); // Garante que a máscara inicial esteja correta com base no select
  }, []);

  useEffect(() => {
    console.log(cleanValueType)
  }, [cleanValueType])
  
  const selecionarFrete = (frete: any) => {
    dispatch(setFreteSelecionado(frete));
  };

  useEffect(() => {
    buscarEndereco(cep)
  }, []);

  useEffect(() => {
    console.log(endereco.bairro)
    console.log(endereco.logradouro)
    console.log(endereco.cidade)
    console.log(endereco.estado)
    console.log(endereco.numero)
  }, [endereco])

  const buscarEndereco = async (cep: string) => {
    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
      
      if (response.data.erro) {
        console.error("CEP não encontrado");
        return;
      }

      setEndereco((prev) => ({
        ...prev,
        cep: response.data.cep,
        logradouro: response.data.logradouro,
        bairro: response.data.bairro,
        cidade: response.data.localidade,
        estado: response.data.uf,
      }));
    } catch (error) {
      console.error("Erro ao buscar o CEP:", error);
    }
  }

  


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
                toAddress: endereco.logradouro,
                toCity: endereco.cidade,
                toDocument: usuario?.numeroDocumento,
                toNumber: endereco.numero,
                toDistrict: endereco.bairro,
                toComplemento: endereco.complemento,
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
            const identificationInput = document.getElementById("form-checkout__identificationNumber") as HTMLInputElement;
            console.log("Número do Documento Enviado:", identificationInput.value);
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

  // Handler genérico para alteração dos campos (exceto número)
  const handleEnderecoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndereco((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleNumeroChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const valor = event.target.value;
    if (/^\d*$/.test(valor)) { // Permite apenas números
      setEndereco((prev) => ({
        ...prev,
        numero: valor
      }));
    }
  };

  useEffect(() => {
    if (produtos && produtos.length > 0) {
      setLoading(false);
    }
    console.log("Produtos: ", produtos)
  }, [produtos]);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
      {/* Seção de Endereço e Frete */}
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl px-4 mt-10 items-start">
        <div className="flex-1">
          <h2 className="text-xl text-center mb-2">Endereço de entrega</h2>
          <form className="space-y-4 bg-white p-6 rounded-lg shadow-lg">
            <input
              type="text"
              name="cep"
              placeholder="Endereço"
              value={endereco.cep}
              onChange={handleEnderecoChange}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              name="estado"
              placeholder="Estado"
              value={endereco.estado}
              onChange={handleEnderecoChange}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              name="cidade"
              placeholder="Cidade"
              value={endereco.cidade}
              onChange={handleEnderecoChange}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              name="bairro"
              placeholder="Bairro"
              value={endereco.bairro}
              onChange={handleEnderecoChange}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              name="logradouro"
              placeholder="Rua"
              value={endereco.logradouro}
              onChange={handleEnderecoChange}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              name="numero"
              placeholder="Número"
              value={endereco.numero}
              onChange={handleNumeroChange}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              name="complemento"
              placeholder="Complemento"
              value={endereco.complemento}
              onChange={handleEnderecoChange}
              className="w-full p-2 border rounded"
            />
          </form>
        </div>

        <div className="flex-1 flex flex-col items-center">
          <h2 className="text-xl text-center mb-2">Opções de Frete</h2>
          <ul className="space-y-2 max-w-60">
            {fretes.map((frete) => (
              <li
                key={frete.id}
                onClick={() => selecionarFrete(frete)}
                className={`
                  p-4 mb-2 cursor-pointer rounded-lg w-full
                  ${freteSelecionado?.id === frete.id ? 'bg-green-100 border-2 border-green-500' : 'bg-white border border-gray-300'}
                  hover:bg-gray-100 transition-colors
                `}
              >
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

      {/* Container para Produtos e Seleção de Pagamento lado a lado */}
      <div className="flex flex-col md:flex-row w-full max-w-6xl px-4 mt-8 gap-8">
        {/* Lista de Produtos */}
        <div className="flex-1">
        <h2 className="text-xl font-semibold text-center">Produtos na sacola</h2>
          {loading ? (
            <p>Carregando produtos...</p>
          ) : (
            produtos.map((p) => (
              <ul key={p.id} className="bg-white p-4 rounded-lg shadow mb-4 text-center">
                <li>
                  <p>{p.nome}</p>
                  <div className="flex justify-center my-5">
                    <img src={p.imagemUrl} alt={p.nome} className="w-20 h-20 object-contain justify-center" />
                  </div>
                  <p>Quantidade: {p.quantidade}</p>
                  <p>
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(p.precoEmCentavos / 100)}
                  </p>
                </li>
              </ul>
            ))
          )}
          <h2 className="text-xl font-semibold mb-4">Total: {totalComFrete}</h2>
        </div>

        {/* Seleção de Pagamento */}
        <div className="flex-1 text-center">
          <h2 className="text-xl font-semibold mb-4">Selecione o tipo de pagamento:</h2>
          <div className="flex justify-center space-x-4 mb-6">
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

          {/* Renderiza o formulário de pagamento de acordo com o método selecionado */}
          {selectedPaymentType === "pix" ? (
            <PixPaymentForm />
          ) : (
            <form
              id="form-checkout"
              ref={formRef}
              className={`bg-white p-6 rounded-lg shadow-lg space-y-4 ${
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
              <select id="form-checkout__identificationType" value={cleanValueType} onChange={handleIdentificationTypeChange} className="w-full border p-2 rounded"></select>
              <InputMask
                mask={mask}
                maskChar=""
                value={maskedValue}
                onChange={handleChange}
              >
                {(inputProps) => (
                  <input
                    {...inputProps}
                    type="text"
                    id="identificationMasked"
                    className="w-full border p-2 rounded"
                    placeholder="Número do Documento"
                  />
                )}
              </InputMask>
              {/* Campo oculto para envio */}
              <input
                type="hidden"
                id="form-checkout__identificationNumber"
                value={cleanValue}
              />
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
          )}
        </div>
      </div>
    </div>

  );
};

export default Pagamento;
