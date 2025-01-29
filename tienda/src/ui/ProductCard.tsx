import { MdOutlineStarOutline } from "react-icons/md";
import { Product } from "../../type";
import AddToCartBtn from "./AddToCartBtn";
import { useState } from "react";
import ProductCardSideNav from "./ProductCardSideNav";
import { useNavigate } from "react-router-dom";
import { config } from "../../config"; // Asegúrate de importar la configuración

interface Props {
  item: Product;
  setSearchText?: (value: string) => void;
}

const ProductCard = ({ item, setSearchText }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigation = useNavigate();

  const open = () => setIsOpen(true);

  const precio = item?.reviews?.[0]?.calificacion || item?.precio || 0;
  const percentage = precio > 0 ? ((precio - (item?.precio || 0)) / precio) * 100 : 0;

  // Generar URL completa de la imagen
  const mainImage = item?.imagenes?.find(img => img.es_principal)?.url  
    ? `${config?.baseUrl}${item.imagenes.find(img => img.es_principal)?.url}`
    : item?.imagenes?.[0]?.url  
      ? `${config?.baseUrl}${item.imagenes[0].url}`
      : 'ruta-a-imagen-por-defecto';

  // Generar alt text de la imagen
  const fallbackImageAlt = item?.imagenes?.find(img => img.es_principal)?.alt_text ||  
                           item?.imagenes?.[0]?.alt_text ||  
                           `Imagen del producto ${item?.nombre}`;

  const handleProduct = () => {
    navigation(`/productos/${item.id}`);
    setSearchText?.("");
  };

  const reviews = item?.reviews || [];
  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, review) => acc + review.calificacion, 0) / reviews.length
    : 0;

  return (
    <div className="border border-gray-200 rounded-lg p-1 overflow-hidden hover:border-amber-300 duration-200 cursor-pointer">
      <div className="w-full h-60 relative p-2 group">
        {percentage > 0 && (
          <span
            onClick={open}
            className="bg-textoAmarillo text-textoRojo absolute left-0 right-0 w-16 text-xs text-center py-1 rounded-md font-semibold inline-block z-10"
          >
            Ahorra {percentage.toFixed(0)}%
          </span>
        )}
        <img
          onClick={handleProduct}
          src={mainImage}
          alt={fallbackImageAlt}
          className="w-full h-full rounded-md object-cover group-hover:scale-110 duration-300"
        />
        <ProductCardSideNav product={item} />
      </div>

      <div className="flex flex-col gap-2 px-2 pb-2">
        <h3 className="text-xs uppercase font-semibold text-textoNegro/70">
          {item?.categorias?.[0]?.nombre || 'Sin categoría'}
        </h3>
        <h2 className="text-lg font-bold line-clamp-2">{item?.nombre || 'Producto sin nombre'}</h2>
        <div className="text-base text-textoRojo flex items-center">
          {[...Array(5)].map((_, index) => (
            <MdOutlineStarOutline
              key={index}
              className={index < averageRating ? "text-yellow-400" : ""}
            />
          ))}
        </div>
        <AddToCartBtn product={item} />
      </div>
    </div>
  );
};

export default ProductCard;
