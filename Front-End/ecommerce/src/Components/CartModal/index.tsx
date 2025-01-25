import React, { useState } from "react"
import "./index.css"
import { MdOutlineClose } from "react-icons/md";

type CartItem = {
    id: number;
    name: string;
    price: number;
    quantity: number;
};

type CartModalProps = {
    isCartOpen: boolean;
    onClose: () => void;
    cartItems: CartItem[];
    updateCartItem: (id: number, quantity: number) => void;
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
      return total + item.price * item.quantity;
    }, 0);
  };

  const totalPrice = calculateTotal();

  if (!isCartOpen && !isClosing) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={`modal-content ${isClosing ? "slide-out" : ""}`}>
        <button className="close-button" onClick={handleClose}>
          <MdOutlineClose/>
        </button>
        <h2>Seu Carrinho</h2>
        {cartItems.length === 0 ? (
          <p>O carrinho está vazio.</p>
        ) : (
            <ul className="cart-items">
            {cartItems.map((item) => (
              <li key={item.id} className="cart-item">
                <div>
                  <span>{item.name}</span>
                  <br/>
                  <span>R${item.price.toFixed(2)}</span>
                </div>
                <div className="quantity-controls">
                  <button
                    onClick={() => updateCartItem(item.id, item.quantity - 1)}
                    disabled={item.quantity === 1}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateCartItem(item.id, item.quantity + 1)}>+</button>
                </div>
              </li>
              ))}
            </ul>
        )}
        <div className="modal-footer">
          <p>Valor total: R${totalPrice}</p>
          <button className="checkout-button">Finalizar Compra</button>
        </div>
      </div>
    </div>
  );
};

export default CartModal;
