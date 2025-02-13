import { useParams } from "react-router-dom";

const StatusPage = () => {
  const { status } = useParams<{ status: string }>();

  const statusInfo = {
    sucesso: {
      title: "Pagamento Aprovado!",
      message: "Obrigado por sua compra! Seu pagamento foi aprovado com sucesso.",
      color: "text-green-600",
    },
    falha: {
      title: "Pagamento Falhou!",
      message: "Ops! Algo deu errado e seu pagamento não foi aprovado. Tente novamente.",
      color: "text-red-600",
    },
    pendente: {
      title: "Pagamento Pendente!",
      message: "Seu pagamento ainda está sendo processado. Aguarde a confirmação.",
      color: "text-yellow-600",
    },
  };

  const info = statusInfo[status as keyof typeof statusInfo] || statusInfo.pendente;

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center p-4">
      <h1 className={`text-3xl font-bold ${info.color}`}>{info.title}</h1>
      <p className="text-lg mt-2 text-gray-700">{info.message}</p>
      <a href="/" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Voltar para o início
      </a>
    </div>
  );
};

export default StatusPage;
