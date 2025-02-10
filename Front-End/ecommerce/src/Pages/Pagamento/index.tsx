import React, { useState, useEffect } from "react";
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import axios from "axios";
import { useDispatch } from "react-redux";
import { clearCart } from "../../Redux/cartSlice";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/store";

initMercadoPago('TEST-7e414755-c026-434d-a4c7-7945e1158e4d');

const Pagamento: React.FC = () => {
  const [preferenceId, setPreferenceId] = useState<string>("");
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const produtos = useSelector((state: RootState) => state.cart.items); // Pegando produtos do Redux
  const emailCliente = useSelector((state: RootState) => state.user.user?.email); // Pegando email do usuário


  useEffect(() => {
    if (produtos.length === 0 || !emailCliente) return;
    const criarVenda = async () => {
      try {
        const response = await axios.post("http://localhost:8083/venda", {
          emailCliente,
          produtos,
        });

        const vendaId = response.data.preferenceId; // Pegamos o ID da preferência
        setPreferenceId(vendaId);
        localStorage.setItem("vendaId", vendaId); // Guardamos o ID da venda para o pagamento
      } catch (error) {
        console.error("Erro ao criar venda:", error);
      }
    };

    if (produtos.length > 0) {
      criarVenda();
    }
  }, [produtos]);


  const initialization = {
    amount: produtos.reduce((acc, produto) => acc + produto.precoEmCentavos * produto.quantidade, 0),
    preferenceId: preferenceId!,  // Passa o preferenceId dinâmico
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

    if (!vendaId) {
      console.error("Venda ID não encontrado");
      return;
    }

    try {
      const response = await axios.post(`http://localhost:8083/${vendaId}/pagamento`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      dispatch(clearCart())
      console.log(response.data)
      navigate("/sucesso")
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
        <p>Erro ao carregar a preferência de pagamento.</p>
      )}
    </div>
  );
};

export default Pagamento;
