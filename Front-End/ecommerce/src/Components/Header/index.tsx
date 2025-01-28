import "./index.css";
import { FaSearch } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { MdOutlineFavoriteBorder, MdOutlineShoppingBag } from "react-icons/md";
import Brand from "../../Assets/logo-tia.jpeg"
import { Link } from "react-router-dom";
import CartModal from "../CartModal";
import { RootState } from "../../Redux/store";
import {useDispatch, useSelector} from "react-redux"
import { useState } from "react";
import { updateCartItemAction } from "../../Redux/cartSlice";

type HeaderProps = {
  categories: string[];
};

const Header: React.FC<HeaderProps> = ({ categories }) => {

  const cartItems = useSelector((state: RootState) => state.cart.items)
  const dispatch = useDispatch()
  const [isCartOpen, setIsCartOpen] = useState(false)

  const updateCartItem = (id: string, newQuantity: number) => {
    dispatch(updateCartItemAction({ id, newQuantity }));
  }

  return (
    <header className="header">
      <div className="header-top">
        <Link to="/" className="logo">
          <img src={Brand} alt="logo da loja" />
        </Link>

        <div className="input-container">
          <input type="text" id="modern-input" placeholder=" " />
          <label htmlFor="modern-input">Pesquisar...</label>
          <button>
            <FaSearch size={20}/>
          </button>
        </div>

        <div className="icons">
          <Link to="/perfil" className="icon">
            <CgProfile/>
          </Link>
          <Link to="/favoritos" className="icon">
            <MdOutlineFavoriteBorder/>
          </Link>
          <Link to="#" className="icon">
            <MdOutlineShoppingBag onClick={() => (setIsCartOpen(true))} />
          </Link>
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

      <CartModal
        isCartOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        updateCartItem={updateCartItem}
      />
    </header>
  );
};

export default Header;
