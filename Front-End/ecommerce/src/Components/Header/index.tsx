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
import { useAuth } from "../../Hooks/useAuth";

type HeaderProps = {
  categories: string[];
};

const Header: React.FC<HeaderProps> = ({ categories }) => {

  const cartItems = useSelector((state: RootState) => state.cart.items)
  const dispatch = useDispatch()
  const [isCartOpen, setIsCartOpen] = useState(false)
  const isAuthenticated = useAuth()

  const updateCartItem = (id: string, newQuantity: number) => {
    dispatch(updateCartItemAction({ id, newQuantity }));
  }

  return (
    <header className="bg-white shadow-md py-4">
      <div className="container mx-auto flex justify-between items-center px-4">
        <Link to="/">
          <img src={Brand} alt="logo da loja" className="w-24 h-auto" />
        </Link>

        <div className="relative flex items-center w-dvw mx-10">
          <input 
            type="text" 
            id="modern-input" 
            placeholder=" " 
            className="w-full border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 pl-4 pr-12 py-3 text-lg rounded-md"
          />
          <label 
            htmlFor="modern-input" 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg"
          >
            Pesquisar...
          </label>
          <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600">
            <FaSearch size={24} />
          </button>
        </div>


        <div className="flex items-center space-x-6">
          <Link to={isAuthenticated ? "/perfil" : "/login"} className="icon text-gray-700 hover:text-blue-500">
            <CgProfile size={30}/>
          </Link>
          <Link to="/favoritos" className="icon text-gray-700 hover:text-blue-500">
            <MdOutlineFavoriteBorder size={30}/>
          </Link>
          <Link to="#" className="icon text-gray-700 hover:text-blue-500">
            <MdOutlineShoppingBag size={30} onClick={() => (setIsCartOpen(true))} />
          </Link>
        </div>
      </div>

      <nav className="bg-gray-100 py-2">
        <div className="container mx-auto">
          <ul className="flex space-x-6 justify-center">
            {categories.map((category, index) => (
              <li key={index}>
                <a 
                  href={`#${category.toLowerCase()}`} 
                  className="text-gray-700 hover:text-blue-500 font-medium"
                >
                  {category}
                </a>
              </li>
            ))}
          </ul>
        </div>
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
