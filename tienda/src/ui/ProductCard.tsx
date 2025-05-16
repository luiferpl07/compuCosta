import { MdOutlineStarOutline } from "react-icons/md";
import { IoLink } from "react-icons/io5";
import { Product } from "../../type";
import AddToCartBtn from "./AddToCartBtn";
import { useState } from "react";
import ProductCardSideNav from "./ProductCardSideNav";
import { useNavigate } from "react-router-dom";
import { getProductImage, getProductImageAlt } from "../../utils/imageUtils";

interface Props {
  item: Product;
  setSearchText?: (value: string) => void;
}

const ProductCard = ({ item, setSearchText }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigation = useNavigate();

  const open = () => setIsOpen(true);

  const precio = item?.reviews?.[0]?.calificacion || item?.lista1 || 0;
  const percentage = precio > 0 ? ((precio - (item?.lista1 || 0)) / precio) * 100 : 0;

  const mainImage = getProductImage(item?.imagenes);
  const fallbackImageAlt = getProductImageAlt(item?.imagenes, item?.nombreproducto);

  const handleProduct = () => {
    navigation(`/productos/${item.idproducto}`);
    setSearchText?.("");
  };

  const reviews = item?.reviews || [];
  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, review) => acc + review.calificacion, 0) / reviews.length
    : 0;

  // For this specific structure, we'll hardcode a check for featured link based on category
  const categorias = Array.isArray(item.categorias)
  ? item.categorias
  : typeof item.categorias === "string"
    ? [{ nombre: item.categorias }]
    : [];
  return (
    <div className="border border-gray-200 rounded-lg p-1 overflow-hidden hover:border-amber-300 duration-200 cursor-pointer relative">
      <div className="w-full h-60 relative p-2 group">
        {percentage > 0 && (
          <span
            onClick={open}
            className="bg-textoAmarillo text-textoRojo absolute left-0 right-0 w-16 text-xs text-center py-1 rounded-md font-semibold inline-block z-10"
          >
            Ahorra {percentage.toFixed(0)}%
          </span>
        )}
        <div className="w-full h-full overflow-hidden rounded-md">
          <img
            onClick={handleProduct}
            src={mainImage}
            alt={fallbackImageAlt}
            className="w-full h-full object-contain hover:scale-110 duration-300"
            loading="lazy"
          />
        </div>
        <ProductCardSideNav product={item} />
      </div>

      <div className="flex flex-col gap-2 px-2 pb-2">
      <h3 className="text-xs uppercase font-semibold text-textoNegro/70">
          {categorias.map(categoria => categoria.nombre).join(", ") || "Sin categoría"}
      </h3>
        <h2 className="text-lg font-bold line-clamp-2">{item?.nombreproducto || 'Producto sin nombre'}</h2>
        <div className="text-base text-textoRojo flex items-center">
          {[...Array(5)].map((_, index) => (
            <MdOutlineStarOutline
              key={index}
              className={index < averageRating ? "text-yellow-400" : ""}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <AddToCartBtn product={item} className="flex-grow" />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;