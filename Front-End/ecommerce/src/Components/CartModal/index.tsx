import React, { useState } from "react"
import { MdOutlineClose } from "react-icons/md";

type CartItem = {
    id: string;
    nome: string;
    precoEmCentavos: number;
    quantidade: number;
};

type CartModalProps = {
    isCartOpen: boolean;
    onClose: () => void;
    cartItems: CartItem[];
    updateCartItem: (id: string, newQuantity: number) => void;
};

const CartModal: React.FC<CartModalProps> = ({ isCartOpen, onClose, cartItems, updateCartItem }) => {
  const [isClosing, setIsClosing] = useState(false);

  // Função para iniciar animação de saída
  const handleClose = () => {
    if (isClosing) return
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300); // Duração da animação de saída
  };

  // Fecha o modal somente se o clique for fora do modal-content
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    if (target.classList.contains('modal-overlay')) {
      handleClose();
    }
  }

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + item.precoEmCentavos * item.quantidade / 100;
    }, 0);
  };

  const totalPrice = calculateTotal();

  if (!isCartOpen && !isClosing) return null;

  return (
    <div className={`modal-overlay fixed inset-0 bg-black bg-opacity-50 z-50 ${isClosing ? "fade-out" : ""}`} onClick={handleOverlayClick}>
      <div className={`fixed right-0 top-0 bg-white w-[20vw] h-full p-4 shadow-lg transition-transform duration-300 ${isClosing ? "translate-x-full" : ""}`}>
        <button className="absolute top-4 left-4" onClick={handleClose}>
          <MdOutlineClose size={24}/>
        </button>
        <h2 className="text-center text-lg font-semibold mb-4">Seu Carrinho</h2>
        {cartItems.length === 0 ? (
          <p>O carrinho está vazio.</p>
        ) : (
            <ul className="space-y-4">
            {cartItems.map((item) => (
              <li key={item.id} className="flex justify-between items-center">
                <div>
                  <span className="block">{item.nome}</span>
                  <span>R${item.precoEmCentavos / 100}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateCartItem(item.id, item.quantidade - 1)}
                    disabled={item.quantidade === 1}
                    className="px-2 py-1 bg-gray-200 rounded"
                  >
                    -
                  </button>
                  <span>{item.quantidade}</span>
                  <button 
                    onClick={() => updateCartItem(item.id, item.quantidade + 1)} 
                    className="px-2 py-1 bg-gray-200 rounded"
                  >
                    +
                  </button>
                </div>
              </li>
              ))}
            </ul>
        )}
        <div className="relative h-full mt-6">
          <p className="font-semibold">Valor total: R${totalPrice}</p>
          <button className="absolute bottom-40 sm:bottom-35 lg:bottom-25 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-6 py-3 rounded-full shadow-lg z-50 text-sm sm:text-base lg:text-lg">
            Finalizar Compra
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartModal;