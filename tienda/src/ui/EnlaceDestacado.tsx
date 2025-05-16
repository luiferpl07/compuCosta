import React from 'react';
import { IoLink } from 'react-icons/io5';
import { CategoryProps } from '../../type';

interface CategoryMoreButtonProps {
  category: CategoryProps;
  className?: string;
  variant?: 'default' | 'outlined';
}

const CategoryMoreButton: React.FC<CategoryMoreButtonProps> = ({ 
  category, 
  className = '',
  variant = 'default'
}) => {
  if (!category.enlaceDestacado) return null;

  const baseClasses = "inline-flex items-center gap-2 px-4 py-2 rounded-md transition-colors text-base font-semibold";
  
  const variantStyles = {
    default: "bg-textoRojo text-white hover:bg-red-800",
    outlined: "border border-textoRojo text-textoRojo hover:bg-red-50"
  };

  return (
    <div className="flex justify-center mt-4">
      <a
        href={category.enlaceDestacado}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseClasses} ${variantStyles[variant]} ${className}`}
      >
        <IoLink className="w-6 h-6" />
        <span>Ver más de {category.nombre}</span>
      </a>
    </div>
  );
};

export default CategoryMoreButton;