import React, { useState } from "react";
import "./index.css";
import { FaSearch } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { MdOutlineFavoriteBorder, MdOutlineShoppingBag } from "react-icons/md";
import Modal from "../Modal";

type HeaderProps = {
  categories: string[];
};

const Header: React.FC<HeaderProps> = ({ categories }) => {
  
  const [isCartOpen, setIsCartOpen] = useState(false)

  const [cartItems, setCartItems] =  useState([{id: 1, name: "shampoo", price: 28, quantity: 1}])

  const updateCartItem = (id: number, newQuantity: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  return (
    <header className="header">
      <div className="header-top">
        <div className="logo">
          <h1>Minha Loja</h1>
        </div>
        <div className="search-bar">
          <input type="text" placeholder="Pesquisar produtos..." />
          <button>
            <FaSearch size={15} />
          </button>
        </div>
        <div className="icons">
          <button className="icon">
            <CgProfile/>
          </button>
          <button className="icon">
            <MdOutlineFavoriteBorder/>
          </button>
          <button className="icon">
            <MdOutlineShoppingBag onClick={() => setIsCartOpen(true)} />
          </button>
        </div>
      </div>

      <nav className="categories">
        <ul>
          {categories.map((category, index) => (
            <li key={index}>
              <a href={`#${category.toLowerCase()}`}>{category}</a>
            </li>
          ))}
        </ul>
      </nav>
      <Modal isCartOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cartItems={cartItems} updateCartItem={updateCartItem} />
    </header>
  );
};

export default Header;
