import React, { useState, useEffect } from "react";
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import axios from "axios";
import { useDispatch } from "react-redux";
import { clearCart } from "../../Redux/cartSlice";
import { useNavigate } from "react-router-dom";

initMercadoPago('YOUR_PUBLIC_KEY');

const Pagamento: React.FC = () => {
  const [preferenceId, setPreferenceId] = useState<string>("");
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // Obter preferenceId do backend
  useEffect(() => {
    const fetchPreference = async () => {
      const response = await fetch("/api/criar-preferencia");
      const data = await response.json();
      setPreferenceId(data.preferenceId);
    };
    
    fetchPreference();
  }, []);

  const initialization = {
    amount: 100,
    preferenceId: preferenceId,  // Passa o preferenceId dinâmico
  };

  const customization = {
    paymentMethods: {
      creditCard: {
        installments: {
          minInstallments: 1,  // Quantidade mínima de parcelas
          maxInstallments: 12, // Quantidade máxima de parcelas
        },
      },
      debitCard: {
        installments: {
          minInstallments: 1,
          maxInstallments: 1, // Cartão de débito geralmente permite uma única parcela
        },
      },
      ticket: {
        installments: {
          minInstallments: 1,
          maxInstallments: 1, // Pagamento com boleto geralmente é pago à vista
        },
      },
      bankTransfer: {
        installments: {
          minInstallments: 1,
          maxInstallments: 1, // Transferências bancárias normalmente também não têm parcelamento
        },
      },
      mercadoPago: ["creditCard", "debitCard", "ticket", "bankTransfer"], // Aqui, pode ser um array de opções ou "all" para habilitar todos os métodos Mercado Pago
    },
  };

  const onSubmit = async ({ formData }: any) => {
    const vendaId = localStorage.getItem("vendaId")
    try {
      const response = await axios.post(`http://localhost:8083//${vendaId}/pagamento`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      dispatch(clearCart())
      navigate("/sucesso")
      return response.data;
    } catch (error) {
      console.error("Erro no pagamento:", error);
      throw error;
    }
  };

  const onError = (error: any) => {
    console.log("Erro no pagamento:", error);
  };

  const onReady = () => {
    console.log("Pagamento pronto");
  };

  return (
    <div>
      <h2>Informações de Pagamento</h2>
      {preferenceId ? (
        <Payment
          initialization={initialization}
          customization={customization}
          onSubmit={onSubmit}
          onReady={onReady}
          onError={onError}
        />
      ) : (
        <p>Carregando...</p>
      )}
    </div>
  );
};

export default Pagamento;
