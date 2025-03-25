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
import { applyFilters, updateSearchQuery } from "../../Redux/productSlice";

type HeaderProps = {
  categories: string[];
};

const Header: React.FC<HeaderProps> = () => {

  const cartItems = useSelector((state: RootState) => state.cart.items)
  const dispatch = useDispatch()
  const [isCartOpen, setIsCartOpen] = useState(false)
  const isAuthenticated = useAuth()
  const searchQuery = useSelector((state: RootState) => state.products.searchQuery);

  const updateCartItem = (id: string, newQuantity: number) => {
    dispatch(updateCartItemAction({ id, newQuantity }));
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(updateSearchQuery(e.target.value));
    dispatch(applyFilters()); // Aplica os filtros imediatamente
  };

  return (
    <header className="bg-white shadow-md py-4">
      <div className="container mx-auto flex justify-between items-center px-4">
        <Link to="/">
          <img src={Brand} alt="logo da loja" className="w-24 h-auto" />
        </Link>

        <div className="relative flex items-center w-dvw ">
          <input 
            type="text" 
            id="modern-input" 
            placeholder="Pesquisar..." 
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 ml-4 pr-12 py-2 text-lg rounded-md"
          />
          <button className="absolute cursor-pointer right-4 top-1/2 transform -translate-y-1/2 text-gray-600">
            <FaSearch size={18} />
          </button>
        </div>


        <div className="ml-2 flex items-center space-x-2">
          <Link to={isAuthenticated ? "/perfil" : "/login"} className="icon text-gray-700 hover:text-blue-500">
            <CgProfile className="text-[1.5rem] md:text-[2rem]" />
          </Link>
          <Link to="/favoritos" className="icon text-gray-700 hover:text-blue-500">
            <MdOutlineFavoriteBorder className="text-[1.5rem] md:text-[2rem]"/>
          </Link>
          <Link to="#" className="icon text-gray-700 hover:text-blue-500">
            <MdOutlineShoppingBag className="text-[1.5rem] md:text-[2rem]" onClick={() => (setIsCartOpen(true))} />
          </Link>
        </div>
      </div>

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
