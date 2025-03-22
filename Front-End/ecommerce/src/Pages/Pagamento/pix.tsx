import React, { useState } from "react";
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
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("CPF");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null);
  const transactionAmount = useSelector((state: RootState) => state.venda.total);
  const mercadoPagoTeste = import.meta.env.VITE_MERCADOPAGO;
  const [copied, setCopied] = useState(false);

  initMercadoPago(mercadoPagoTeste)

  const gerarPix = async () => {
    try {
      const dateOfExpiration = new Date();
      dateOfExpiration.setMinutes(dateOfExpiration.getMinutes() + 30); // Expira em 30 minutos

      const payload = {
        transactionAmount,
        paymentMethodId: "pix",
        vendaId,
        payer: {
          email: user?.email,
          firstName: nome,
          identification: {
            type: tipoDocumento,
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

  const handleDocumentInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove não numéricos

    if (tipoDocumento === "CPF") {
      if (value.length > 3) value = value.slice(0, 3) + "." + value.slice(3);
      if (value.length > 7) value = value.slice(0, 7) + "." + value.slice(7);
      if (value.length > 11) value = value.slice(0, 11) + "-" + value.slice(11);
      setNumeroDocumento(value.slice(0, 14));
    } else {
      if (value.length > 2) value = value.slice(0, 2) + "." + value.slice(2);
      if (value.length > 6) value = value.slice(0, 6) + "." + value.slice(6);
      if (value.length > 10) value = value.slice(0, 10) + "/" + value.slice(10);
      if (value.length > 15) value = value.slice(0, 15) + "-" + value.slice(15);
      setNumeroDocumento(value.slice(0, 18));
    }
  };

  const copyPixCode = async () => {
    try {
      await navigator.clipboard.writeText(pixData?.qrCode || '');
      setCopied(true);
    } catch (err) {
      setError('Não foi possível copiar o código');
    }
  };
  

  return (
    <div className="h-full bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md mx-auto mb-5">
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        <h2 className="text-2xl font-bold mb-6 text-center">Pagamento</h2>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">

          {/* Informações do Cliente */}
          <div className="flex flex-col">
            <label className="text-gray-700 mb-1">Nome</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-gray-700 mb-1">Sobrenome</label>
            <input
              type="text"
              value={sobrenome}
              onChange={(e) => setSobrenome(e.target.value)}
              required
              className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-gray-700 mb-1">Tipo de Documento</label>
            <select
              value={tipoDocumento}
              onChange={(e) => setTipoDocumento(e.target.value)}
              className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="CPF">CPF</option>
              <option value="CNPJ">CNPJ</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-gray-700 mb-1">Número do Documento</label>
            <input type="text" value={numeroDocumento} onChange={handleDocumentInput} className="p-2 border rounded w-full" maxLength={tipoDocumento === "CPF" ? 14 : 18} />

          </div>

            <div className="flex flex-col items-center">
              {!pixData ? (
                <button
                  type="button"
                  onClick={gerarPix}
                  disabled={loading}
                  className="w-full cursor-pointer bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
                >
                  {loading ? "Gerando QR Code..." : "Gerar Pix"}
                </button>
              ) : (
                <>
                  <h3 className="text-xl font-semibold mb-2">Pagamento via Pix</h3>
                  <img
                    src={`data:image/png;base64,${pixData.code}`}
                    alt="QR Code"
                    className="mb-2 w-48 h-48 mx-auto"
                  />
                   <div className="w-full flex gap-2 mb-2">
                    <input
                      type="text"
                      value={pixData.qrCode}
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
                </>
              )}
            </div>
        </form>
      </div>
    </div>
  );
};

export default Pagamento;