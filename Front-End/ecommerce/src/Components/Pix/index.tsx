import React from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PixCode: React.FC<{ code: string }> = ({ code }) => {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Código PIX copiado com sucesso!", {
        position: "top-center",
        autoClose: 2000,
      });
    } catch (err) {
      toast.error("Falha ao copiar o código PIX");
    }
  };

  return (
    <div className="text-center items-center flex flex-col max-w-md overflow-hidden p-4 border rounded-lg shadow-md bg-white">
      <p className="text-lg font-semibold">Código PIX</p>
      <div
        onClick={copyToClipboard}
        className="cursor-pointer bg-gray-100 p-2 mt-2 rounded-lg text-gray-700 hover:bg-gray-200 transition-all"
      >
        {code}
      </div>
    </div>
  );
};

export default PixCode;
