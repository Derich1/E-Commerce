import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../Redux/store';

// Declaração global para o objeto MercadoPago
declare global {
  interface Window {
    MercadoPago: any;
    paymentBrickController: any;
  }
}

const PaymentBrick: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [vendaId, setVendaId] = useState("")
  const preferenceId = useSelector((state: RootState) => state.venda.preferenceId)
  const total = useSelector((state: RootState) => state.venda.total)

  useEffect(() => {
    const id = localStorage.getItem("vendaId") || "";
    setVendaId(id);
  }, []);


  useEffect(() => {
    // Cria e adiciona o script da SDK do Mercado Pago se ainda não estiver carregado
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;
    document.body.appendChild(script);

    script.onload = async () => {
      if (window.MercadoPago && containerRef.current) {
        const mp = new window.MercadoPago('TEST-7e414755-c026-434d-a4c7-7945e1158e4d', {
          locale: 'pt',
        });
        const bricksBuilder = mp.bricks();

        const settings = {
          initialization: {
            // "amount" representa a quantia total a pagar
            amount: total,
            // "preferenceId" definido pelo backend
            preferenceId: preferenceId,
            payer: {
              firstName: '',
              lastName: '',
              email: '',
            },
          },
          customization: {
            visual: {
              style: {
                theme: 'default',
              },
            },
            paymentMethods: {
              creditCard: 'all',
              atm: 'all',
              ticket: 'all',
              debitCard: 'all',
              bankTransfer: 'all',
              maxInstallments: 1,
            },
          },
          callbacks: {
            onReady: () => {
              // Callback chamado quando o Brick estiver pronto
              // Ex.: ocultar o loader do site
            },
            onSubmit: async ({ formData }: any) => {
              try {
                // Envia os dados do pagamento usando axios para o seu endpoint
                const response = await axios.post(
                  `http://localhost:8083/venda/${vendaId}/pagamento`,
                  formData,
                  {
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  }
                );
                // Aqui você pode tratar a resposta do backend se necessário
                return response.data;
              } catch (error) {
                console.error('Erro no pagamento:', error);
                throw error;
              }
            },
            onError: (error: any) => {
              // Callback para tratar erros do Brick
              console.error('Payment Brick error:', error);
            },
          },
        };

        // Cria o Brick de pagamento dentro do container referenciado
        window.paymentBrickController = await bricksBuilder.create(
          'payment',
          containerRef.current,
          settings
        );
      }
    };

    // Cleanup: remove o script quando o componente for desmontado
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return <div id="paymentBrick_container" ref={containerRef}></div>;
};

export default PaymentBrick;
