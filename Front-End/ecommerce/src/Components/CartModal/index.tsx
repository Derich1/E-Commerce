// 1. Importações adicionando Framer Motion
import React, { useEffect } from "react";
import { MdOutlineClose } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"; // Importação do Framer Motion
import ReactDOM from "react-dom";
import { toast } from "react-toastify";
import { clearImmediatePurchase } from "../../Redux/vendaSlice";
import { useDispatch } from "react-redux";

type CartItem = {
    id: string;
    nome: string;
    precoEmCentavos: number;
    quantidade: number;
    estoque: number;
};

type CartModalProps = {
    isCartOpen: boolean;
    onClose: () => void;
    cartItems: CartItem[];
    updateCartItem: (id: string, newQuantity: number) => void;
};

const CartModal: React.FC<CartModalProps> = ({ isCartOpen, onClose, cartItems, updateCartItem }) => {
  const handleClose = () => onClose();
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleComprarCarrinho = () => {
    handleClose()
    dispatch(clearImmediatePurchase())
    navigate("/compra")
  }

  const calculateTotal = () => {
      return cartItems.reduce((total, item) => {
          return total + (item.precoEmCentavos * item.quantidade) / 100;
      }, 0);
  };

  const handleIncreaseQuantity = (item: CartItem) => {
    if (item.quantidade < item.estoque) {
        updateCartItem(item.id, item.quantidade + 1);
    } else {
        // Opcional: exibir uma mensagem para o usuário informando que não há mais estoque.
        toast.error(`O estoque atual do item é ${item.estoque}`)
    }
  };

  const handleDecreaseQuantity = (item: CartItem) => {
    updateCartItem(item.id, item.quantidade - 1)
  }
 
  // Bloquear scroll da página quando o modal estiver aberto
  useEffect(() => {
      if (isCartOpen) {
          document.body.style.overflow = "hidden";
      } else {
          document.body.style.overflow = "auto";
      }
      
      return () => {
          document.body.style.overflow = "auto";
      };
  }, [isCartOpen]);

  const totalPrice = calculateTotal();

  // Usar ReactDOM.createPortal para renderizar fora da hierarquia normal
  return ReactDOM.createPortal(
      <AnimatePresence>
          {isCartOpen && (
              <motion.div
                  className="fixed inset-0 z-[9999] flex" // Z-index extremamente alto
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={handleClose}
                  role="dialog"
                  aria-modal="true"
              >
                  {/* Overlay escuro */}
                  <motion.div
                      className="absolute inset-0 bg-black bg-opacity-50"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                  />
                  
                  {/* Conteúdo do Modal */}
                  <motion.div
                      className="ml-auto bg-white w-full md:w-[70vw] lg:w-[50vw] xl:w-[35vw] h-full p-4 shadow-lg relative z-[10000] flex flex-col"
                      initial={{ x: "100%" }}
                      animate={{ x: 0 }}
                      exit={{ x: "100%" }}
                      transition={{ type: "tween", duration: 0.3 }}
                      onClick={(e) => e.stopPropagation()}
                  >
                      <div className="flex-shrink-0">
                          <button
                              className="cursor-pointer absolute top-4 right-4 md:left-4 md:right-auto"
                              onClick={handleClose}
                              aria-label="Fechar carrinho"
                          >
                              <MdOutlineClose size={24} />
                          </button>
                          <h2 className="text-center text-xl md:text-2xl font-semibold mb-4 md:mb-6">
                              Seu Carrinho
                          </h2>
                      </div>

                      <div className="flex-1 overflow-y-auto pb-20">
                          {cartItems.length === 0 ? (
                              <p>O carrinho está vazio.</p>
                          ) : (
                              <ul className="space-y-4 mb-8">
                                  {cartItems.map((item) => (
                                      <li
                                          key={item.id}
                                          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 p-3 bg-gray-50 rounded-lg"
                                      >
                                          <div className="flex-1">
                                              <span className="block font-medium text-base md:text-lg">
                                                  {item.nome}
                                              </span>
                                              <span className="block text-sm md:text-base text-gray-600">
                                                  {new Intl.NumberFormat("pt-BR", {
                                                      style: "currency",
                                                      currency: "BRL",
                                                  }).format(item.precoEmCentavos / 100)}
                                              </span>
                                          </div>
                                          <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm w-full md:w-auto">
                                              <button
                                                  onClick={() => handleDecreaseQuantity(item)}
                                                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                                              >
                                                  -
                                              </button>
                                              <span className="min-w-[30px] text-center">{item.quantidade}</span>
                                              <button
                                                onClick={() => handleIncreaseQuantity(item)}
                                                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                              >
                                                  +
                                              </button>
                                          </div>
                                      </li>
                                  ))}
                              </ul>
                          )}
                      </div>

                      <div className="pt-4 border-t border-gray-200 mt-auto bg-white sticky bottom-0">
                          <p className="text-lg md:text-xl font-bold mb-4 text-center">
                              Total:{" "}
                              {new Intl.NumberFormat("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                              }).format(totalPrice)}
                          </p>
                          <button
                              onClick={handleComprarCarrinho}
                              className="block cursor-pointer w-full bg-blue-500 hover:bg-blue-600 text-white text-center py-3 px-6 rounded-lg transition-colors text-sm md:text-base"
                          >
                              Finalizar Compra
                          </button>
                      </div>
                  </motion.div>
              </motion.div>
          )}
      </AnimatePresence>,
      document.body // Renderizar diretamente no body para evitar problemas de z-index
  );
};

export default CartModal;