import React from "react";
import { useDispatch } from "react-redux";
import "./"
import { IoFilter } from "react-icons/io5";
import { useLocation } from "react-router-dom";
import { filterProducts } from "../../Redux/productSlice";

type FilterModalProps = {
  categories: string[];

};

const FilterModal: React.FC<FilterModalProps> = ({ categories }) => {
  const dispatch = useDispatch();

  const handleCategoryClick = (category: string) => {
    dispatch(filterProducts(category));
  };

  const location = useLocation();

  // Verifica se a URL contém "/produto" para esconder o filtro
  const caminhosParaEsconder = ["/produto", "/login", "cadastro", "perfil"];
  const esconderFiltro = caminhosParaEsconder.some(caminho => location.pathname.includes(caminho));


  return (
    !esconderFiltro && (
    <div className="fixed top-44 left-5 w-1/6 h-full z-50 p-4">
        
        <h2 className="flex items-center gap-2">Filtrar <IoFilter className=""/></h2>
        <ul className="mt-[5%] ml-[5%]">
          {categories.map((category) => (
            <li
              key={category}
              className="cursor-pointer hover:underline"
              
              onClick={() => handleCategoryClick(category)}
            >
              {category}
            </li>
          ))}
        </ul>
    </div>
    )
  );
};

export default FilterModal;
