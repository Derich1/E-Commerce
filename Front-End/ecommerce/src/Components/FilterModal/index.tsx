import React from "react";
import "./index.css"
import { IoFilter } from "react-icons/io5";

type FilterModalProps = {
  categories: string[];
  onFilter: (category: string) => void;
};

const FilterModal: React.FC<FilterModalProps> = ({
  categories,
  onFilter,
}) => {
  const handleCategoryClick = (category: string) => {
    onFilter(category)
  };

  return (
    <div className="filter-modal-persistent">
        
        <h2>Filtrar <IoFilter/></h2>
        <ul className="categories-list">
          {categories.map((category) => (
            <li
              key={category}
              className="category-item"
              onClick={() => handleCategoryClick(category)}
            >
              {category}
            </li>
          ))}
        </ul>
    </div>
  );
};

export default FilterModal;
