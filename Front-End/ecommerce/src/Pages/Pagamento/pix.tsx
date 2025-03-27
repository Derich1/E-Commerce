import React, { useEffect, useState } from "react";
import { initMercadoPago } from "@mercadopago/sdk-react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "../../Redux/cartSlice";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../Redux/store";



const Pagamento: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // const produtos = useSelector((state: RootState) => state.cart.items);
  const vendaId = useSelector((state: RootState) => state.venda.vendaId);
  const user = useSelector((state: RootState) => state.user.user)
  const [pixData, setPixData] = useState<{ qrCode: string; code: string } | null>(null);
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null);
  const mercadoPagoTeste = import.meta.env.VITE_MERCADOPAGO;
  const [copied, setCopied] = useState(false);
  const primeiroNome = user?.nome.split(" ")[0]
  const numeroDocumento = user?.numeroDocumento

  const freteSelecionado = useSelector((state: RootState) => state.frete.freteSelecionado);
  const totalVenda = Number(useSelector((state: RootState) => state.venda.total) || 0)
  const valorFrete = Number(freteSelecionado?.price) || 0
  const totalComFrete = Math.round((totalVenda + valorFrete) * 100) / 100; 

  const tipoDeDocumento = () => {  
    if (user?.numeroDocumento.length === 11 ){
      return "CPF"
    } else {
      return "CNPJ"
    }
  }

  initMercadoPago(mercadoPagoTeste)

  useEffect(() => {
    setLoading(true)

    console.log("Total com frete pix frontend: " + totalComFrete)

    const gerarPix = async () => {
      try {
        const dateOfExpiration = new Date();
        dateOfExpiration.setMinutes(dateOfExpiration.getMinutes() + 30); // Expira em 30 minutos
  
        const payload = {
          transactionAmount: totalComFrete,
          paymentMethodId: "pix",
          vendaId,
          payer: {
            email: user?.email,
            firstName: primeiroNome,
            identification: {
              type: tipoDeDocumento,
              number: numeroDocumento,
            },
          },
          dateOfExpiration: dateOfExpiration.toISOString(),
        };
        console.log("Payload enviado:", payload);
        const response = await axios.post(`http://localhost:8083/venda/pix`, payload);
    
        setPixData({
          qrCode: response.data.pix_data.qr_code,
          code: response.data.pix_data.qr_code_base64,
        });
  
        if (response.data.status === "approved") {
          dispatch(clearCart());
          navigate("/sucesso");
        }
    
      } catch (error: any) {
        setError(error.response?.data?.error || "Erro ao gerar Pix");
      } finally {
        setLoading(false)
      }
    }

    gerarPix()
  }, [])
  

  const copyPixCode = async () => {
    try {
      await navigator.clipboard.writeText(pixData?.qrCode || '');
      setCopied(true);
    } catch (err) {
      setError('Não foi possível copiar o código');
    }
  };
  
  if (loading){
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    )
  }

  return (
    <div className="h-full bg-gray-100 flex items-center justify-center p-4">

            <div className="flex flex-col items-center">
              {error && <p>{error}</p>}
                  <h3 className="text-xl font-semibold mb-2">Pagamento via Pix</h3>
                  <img
                    src={`data:image/png;base64,${pixData?.code}`}
                    alt="QR Code"
                    className="mb-2 w-48 h-48 mx-auto"
                  />
                   <div className="w-full flex gap-2 mb-2">
                    <input
                      type="text"
                      value={pixData?.qrCode}
                      readOnly
                      className="p-2 border rounded flex-1 text-center"
                    />
                    <button
                      type="button"
                      onClick={copyPixCode}
                      className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                    >
                      {copied ? '✓ Copiado!' : 'Copiar'}
                    </button>
                  </div>
                  {copied && (
                    <span className="text-green-600 text-sm block text-center">
                      Código copiado para a área de transferência!
                    </span>
                  )}
            </div>
      </div>
  );
};

export default Pagamento;