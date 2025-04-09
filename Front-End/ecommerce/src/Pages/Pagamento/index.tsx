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
import { toast } from "react-toastify";
import { clearCart } from "../../Redux/cartSlice";

declare global {
  interface Window {
    MercadoPago: any;
  }
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

  const [endereco, setEndereco] = useState<Endereco>({
    cep: "",
    logradouro: "",
    bairro: "",
    cidade: "",
    estado: "",
    numero: "",
    complemento: ""
  });

  type PaymentMethod = 'credit_card' | 'debit_card' | 'pix';

  const navigate = useNavigate();
  const cardFormRef = useRef<any>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const packages = useSelector((state: RootState) => state.package.package)
  const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentMethod>();
  const vendaId = useSelector((state: RootState) => state.venda.vendaId);
  const mercadoPagoTeste = import.meta.env.VITE_MERCADOPAGO;

  if (!packages) return

  const fretes = useSelector((state: RootState) => state.frete.fretes)
    .filter(frete => {
      if (frete.error) return false;
      
      return true;
  });

  const freteSelecionado = useSelector((state: RootState) => state.frete.freteSelecionado);
  const dispatch = useDispatch()  
  const cep = useSelector((state: RootState) => state.endereco.cep)
  const usuario = useSelector((state: RootState) => state.user.user)
  const produtos = useSelector((state: RootState) => state.venda.produtos)
  const totalVenda = Number(useSelector((state: RootState) => state.venda.total) || 0)
  const valorFrete = Number(freteSelecionado?.price) || 0
  const totalComFrete = Math.round((totalVenda + valorFrete) * 100) / 100; 
  const [loading, setLoading] = useState<boolean>(true);
  const [maskedValue, setMaskedValue] = useState("");
  const [cleanValue, setCleanValue] = useState("");
  const [mask, setMask] = useState("999.999.999-99"); // Começa com a máscara de CPF
  const [cleanValueType, setCleanValueType] = useState("")
  const [selectedInstallment, setSelectedInstallment] = useState<{ parcelas: string; valorTotal: string } | null>(null);
  const selectedInstallmentRef = useRef<{ parcelas: string; valorTotal: string } | null>(null);

  // "Produto A (Quantidade: 2), Produto B (Quantidade: 1), Produto C (Quantidade: 5)"
  const description = produtos.map(produto => `${produto.nome} (Quantidade: ${produto.quantidade})`).join(', ');

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
  
  const selecionarFrete = (frete: any) => {
    dispatch(setFreteSelecionado(frete));
  };

  useEffect(() => {
    buscarEndereco(cep)
  }, []);

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

  useEffect(() => {
    console.log("Método de pagamento: " + selectedPaymentType)
  }, [selectedPaymentType])

  
  useEffect(() => {
    const installmentsElement = document.getElementById("form-checkout__installments") as HTMLSelectElement;
    if (!installmentsElement) return;
    
    const handleChange = () => {
      const selectedOption = installmentsElement.options[installmentsElement.selectedIndex]?.text;
      console.log("Opção selecionada:", selectedOption);
      
      const match = selectedOption?.match(/(\d+) parcelas? de .* \(R\$ ([\d,.]+)\)/);
      if (match) {
        const numParcelas = match[1]; // Número de parcelas
        const valorTotalStr = match[2]; // Valor total como string

        console.log("Valor total extraído antes da conversão:", valorTotalStr);

        const valorTotal = valorTotalStr.replace(',', '.');

        console.log("Valor total convertido para número:", Number(valorTotal));
        setSelectedInstallment({
          parcelas: numParcelas,
          valorTotal: valorTotalStr,
        });
      }
    };
    
    installmentsElement.addEventListener("change", function () {
      const selectedOption = installmentsElement.options[installmentsElement.selectedIndex]?.text;
      console.log("Opção selecionada:", selectedOption);
    
      const match = selectedOption.match(/(\d+) parcelas? de .* \(R\$ ([\d,.]+)\)/);
    
      if (match) {
        const numParcelas = match[1]; // Número de parcelas
        const valorTotal = match[2]; // Valor total
    
        console.log("Número de Parcelas:", numParcelas);
        console.log("Valor Total:", valorTotal);
    
        const installmentData = { parcelas: numParcelas, valorTotal: valorTotal };
    
        // Atualiza o state
        setSelectedInstallment(installmentData);
    
        // Atualiza o ref para garantir o valor atualizado
        selectedInstallmentRef.current = installmentData;
      }
    });
    
    
    return () => {
      installmentsElement.removeEventListener("change", handleChange);
    };
  }, [mercadoPagoTeste]);
  

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

      if (!endereco.numero) return;

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
          },
          onSubmit: async (event: React.FormEvent) => {
            event.preventDefault();
            console.log("Xesque" + selectedInstallment?.valorTotal)

            if (!freteSelecionado) {
              toast.error("Por favor, selecione uma opção de frete");
              return;
            }

            if (!cardFormRef.current) return;

            const cardFormData = cardFormRef.current.getCardFormData();
            if (!cardFormData || !cardFormData.paymentMethodId || !cardFormData.token) {
              console.warn("Dados do formulário incompletos");
              return;
            }

            console.log("Total Calculado:", totalComFrete.toFixed(2))

            const {
              paymentMethodId: payment_method_id,
              issuerId: issuer_id,
              cardholderEmail: email,
              token,
              installments,
              identificationType,
              identificationNumber, // valor do cardForm
            } = cardFormData;

            const totalComFreteNumber = isNaN(Number(totalComFrete)) ? 0 : Number(totalComFrete);

            // Levando em consideração o parcelamento também.
            const valorTotalNumber = Number(
              (selectedInstallment?.valorTotal || selectedInstallmentRef.current?.valorTotal || totalComFreteNumber)
            );
            
            // Quantidade de parcelas
            const installmentsNumber = isNaN(Number(installments)) ? 1 : Number(installments);

            // Verifique no console antes de enviar:
            console.log("Valores enviados:", { totalComFreteNumber, valorTotalNumber, installmentsNumber });


            try {
              let status = ""
              if (selectedPaymentType === 'credit_card'){
                const response = await postCredit(
                  token,
                  issuer_id,
                  payment_method_id,
                  valorTotalNumber,
                  Number(installments),
                  description,
                  email,
                  identificationType,
                  identificationNumber,
                  selectedPaymentType,
                  vendaId,
                );
                console.log("Resposta recebida:", response.data);
                status = response.data.status;
                console.log("Status recebido:", status);
              }
              
              if (selectedPaymentType === 'debit_card'){
                const response = await postCredit(
                  token,
                  issuer_id,
                  payment_method_id,
                  totalComFrete,
                  Number(installments),
                  description,
                  email,
                  identificationType,
                  identificationNumber,
                  selectedPaymentType,
                  vendaId,
                );
                console.log("Resposta recebida:", response.data);
                status = response.data.status;
                console.log("Status recebido:", status);
              }

              const entregaRequest = {
                toPostalCode: cep,
                toName: usuario?.nome,
                toPhone: usuario?.telefone,
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
                insuranceValue: 1,
                service: freteSelecionado?.id,
                productName: produtos.map(p => p.nome),
                productQuantity: produtos.map(p => p.quantidade),
                productUnitaryValue: produtos.map(p => p.precoEmCentavos),
                volume: {
                  height: packages.height,
                  width: packages.width,
                  length: packages.length,
                  weight: packages.weight
                }
                ,
                vendaId: vendaId
              };
              console.log("Enviando para o backend: " + entregaRequest.toPhone)
              console.log("Método de pagamento enviado:", selectedPaymentType);

          
              await axios.post("http://localhost:8083/venda/inserirFrete", entregaRequest)
              dispatch(clearCart())
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

  type PaymentType = 'credit_card' | 'debit_card' | 'pix';

  const handleSetPaymentType = (type: PaymentType) => {
    const errors: string[] = [];

    if (!freteSelecionado) {
      errors.push("Selecione uma opção de frete primeiro");
    }

    if (!endereco?.numero) {
      errors.push("Preencha o número da sua residência");
    }

    if (errors.length > 0) {
      errors.forEach(msg => toast.error(msg));
      return;
    }

    setSelectedPaymentType(type);
  };


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
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Seção de Endereço e Frete */}
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Endereço de entrega</h2>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">CEP</label>
              <input
                type="text"
                name="cep"
                readOnly
                placeholder="00000-000"
                value={endereco.cep}
                onChange={handleEnderecoChange}
                className="w-full px-4 py-3 border cursor-not-allowed border-gray-300 rounded-lg bg-gray-100 text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Estado</label>
                <input
                  type="text"
                  name="estado"
                  readOnly
                  value={endereco.estado}
                  onChange={handleEnderecoChange}
                  className="w-full px-4 py-3 border cursor-not-allowed border-gray-300 rounded-lg bg-gray-100 text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Cidade</label>
                <input
                  type="text"
                  name="cidade"
                  readOnly
                  value={endereco.cidade}
                  onChange={handleEnderecoChange}
                  className="w-full px-4 py-3 border cursor-not-allowed border-gray-300 rounded-lg bg-gray-100 text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Bairro</label>
                <input
                  type="text"
                  name="bairro"
                  readOnly
                  value={endereco.bairro}
                  onChange={handleEnderecoChange}
                  className="w-full px-4 py-3 border cursor-not-allowed border-gray-300 rounded-lg bg-gray-100 text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Rua</label>
                <input
                  type="text"
                  name="logradouro"
                  readOnly
                  value={endereco.logradouro}
                  onChange={handleEnderecoChange}
                  className="w-full px-4 py-3 border cursor-not-allowed border-gray-300 rounded-lg bg-gray-100 text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Número</label>
                <input
                  type="text"
                  name="numero"
                  value={endereco.numero}
                  onChange={handleNumeroChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Complemento</label>
                <input
                  type="text"
                  name="complemento"
                  value={endereco.complemento}
                  onChange={handleEnderecoChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500"
                />
              </div>
          </form>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Opções de Frete</h2>
          <div className="space-y-4">
            {fretes.map((frete) => (
              <div
                key={frete.id}
                onClick={() => selecionarFrete(frete)}
                className={`
                  p-4 cursor-pointer rounded-lg border-2 transition-all
                  ${freteSelecionado?.id === frete.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'}
                `}
              >
                <div className="flex items-center gap-4">
                  <img src={frete.company.picture} alt={frete.company.name} className="w-14 h-14 object-contain rounded-lg" />
                  <div className="flex-1">
                    <div className="flex flex-col justify-between items-start">
                      <h3 className="font-semibold text-gray-800">{frete.name}</h3>
                      <p className="text-base font-bold text-blue-600">R$ {frete.price}</p>
                    </div>
                    {frete.delivery_range && frete.delivery_range.min && frete.delivery_range.max && (
                      <p className="text-sm text-gray-500">
                        Estimativa de entrega: {frete.delivery_range.min} - {frete.delivery_range.max} dias
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Container para Produtos e Seleção de Pagamento lado a lado */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Lista de Produtos */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">Produtos na sacola</h2>
          <div className="space-y-3 sm:space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : (
              produtos.map((p) => (
                <div key={p.id} className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20">
                    <img src={p.imagemUrl} alt={p.nome} className="w-full h-full object-contain rounded-lg" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{p.nome}</h3>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-500">
                        Quantidade: {p.quantidade}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Subtotal:</span>
                        <span className="text-sm text-gray-500">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format((p.quantidade * p.precoEmCentavos) / 100)}
                        </span>
                      </div>
                      <span className="font-medium text-gray-700">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(p.precoEmCentavos / 100)}
                      </span>
                    </div>
                </div>
                </div>
              ))
            )}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-gray-800">Frete:</span>
              <span className="text-2xl font-bold text-green-600">
                  {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(valorFrete)}
                </span>
                </div>
                <div className="flex justify-between mt-2 items-center">
                <span className="text-xl font-bold text-gray-800">Total:</span>
                <span className="text-2xl font-bold text-green-600">
                  {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(totalComFrete)}
                </span>
                </div>
            </div>
        </div>

        {/* Seleção de Pagamento */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Pagamento</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-8">
            {(['credit_card', 'debit_card', 'pix'] as const).map((type) => (
            <button
              key={type}
              onClick={() => handleSetPaymentType(type)}
              className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                selectedPaymentType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type === 'credit_card' && 'Cartão de Crédito'}
              {type === 'debit_card' && 'Cartão de Débito'}
              {type === 'pix' && 'PIX'}
            </button>
             ))}
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
  </div>
  );
};

export default Pagamento;
