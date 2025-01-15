import React from "react"
import "./index.css"

type CartItem = {
    id: number;
    name: string;
    price: number;
    quantity: number;
};

type ModalProps = {
    isCartOpen: boolean;
    onClose: () => void;
    cartItems: CartItem[];
    updateCartItem: (id: number, quantity: number) => void;
};

const Modal: React.FC<ModalProps> = ({ isCartOpen, onClose, cartItems, updateCartItem }) => {
  if (!isCartOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          ✖
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
          <button className="checkout-button">Finalizar Compra</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
