import { MdOutlineStarOutline, MdStar, MdStarHalf } from "react-icons/md";
import { Product } from "../../type";
import AddToCartBtn from "./AddToCartBtn";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProductImage, getProductImageAlt } from "../../utils/imageUtils";
import ProductCardSideNav from "./ProductCardSideNav";

interface Props {
  item: Product;
  setSearchText?: (value: string) => void;
}

const ProductCard = ({ item, setSearchText }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigation = useNavigate();

  const open = () => setIsOpen(true);

  const isLista2Active = item?.lista2_activa === true;
  const hasLista2Price = item?.lista2 && item.lista2 > 0;
  const showLista2 = isLista2Active && hasLista2Price;

  const precioOriginal = showLista2 ? item.lista2 : item?.lista1 || 0;
  const precioFinal = item?.lista1 || 0;
  const percentage = showLista2 && precioOriginal > precioFinal
    ? ((precioOriginal - precioFinal) / precioOriginal) * 100
    : 0;

  const mainImage = getProductImage(item?.imagenes);
  const fallbackImageAlt = getProductImageAlt(item?.imagenes, item?.nombreproducto);

  const handleProduct = () => {
    const scrollY = Math.max(
      window.scrollY,
      window.pageYOffset,
      document.documentElement.scrollTop,
      document.body.scrollTop,
      0
    );

    try {
      const viewState = {
        scrollY,
        search: window.location.search || "",
        page: 1,
        productId: item.idproducto,
        timestamp: Date.now()
      };
      sessionStorage.setItem("productsViewState", JSON.stringify(viewState));
    } catch {
      // ignore storage failures
    }

    navigation(`/productos/${item.idproducto}`);
  };

  const reviewCount = item.reseñasCount || item.reviews?.length || 0;
  const averageRating = item.puntuacionPromedio ||
    (item.reviews?.length > 0
      ? item.reviews.reduce((acc: number, rev: any) => acc + rev.calificacion, 0) / item.reviews.length
      : 0);

  const getCategoriesDisplay = (categorias: any) => {
    if (typeof categorias === "string") {
      if (categorias.includes(",")) {
        const categoriasArray = categorias.split(",").map(cat => cat.trim());
        return categoriasArray[categoriasArray.length - 1];
      }
      return categorias;
    }

    if (!Array.isArray(categorias) || categorias.length === 0) {
      return "Sin categoría";
    }

    const categoriasNormalizadas = categorias.map(item => {
      if (item.categoria) return item.categoria;
      else if (item.nombre) return item;
      return item;
    });

    const subcategorias = [];
    const categoriasPadre = [];

    for (const cat of categoriasNormalizadas) {
      if (cat.padre_id && cat.padre_id !== null) {
        subcategorias.push(cat);
      } else {
        categoriasPadre.push(cat);
      }
    }

    if (subcategorias.length > 0) return subcategorias.map(cat => cat.nombre).join(", ");
    if (categoriasPadre.length > 0) return categoriasPadre.map(cat => cat.nombre).join(", ");

    return "Sin categoría";
  };

  return (
    <div data-product-id={item.idproducto} className="group border border-gray-200 rounded-lg p-1 overflow-hidden hover:border-amber-300 duration-200 cursor-pointer relative">
      <div className="w-full h-60 relative p-2">
        {/* Badge de descuento */}
        {showLista2 && percentage > 0 && item.lista2 > item.lista1 && (
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
          {getCategoriesDisplay(item.categorias)}
        </h3>

        <h2
          onClick={handleProduct}
          className="text-lg font-bold line-clamp-2 cursor-pointer hover:text-amber-600 duration-200"
        >
          {item?.nombreproducto || 'Producto sin nombre'}
        </h2>

        <div className="flex items-center gap-1">
          <div className="flex items-center text-base">
            {[...Array(5)].map((_, index) => {
              const ratingValue = index + 1;
              const ratingFloat = parseFloat(averageRating.toString());
              const isHalfStar = ratingFloat - index > 0 && ratingFloat - index < 1;
              const isFullStar = ratingFloat >= ratingValue;

              return isFullStar ? (
                <MdStar key={index} className="text-yellow-400 w-4 h-4" />
              ) : isHalfStar ? (
                <MdStarHalf key={index} className="text-yellow-400 w-4 h-4" />
              ) : (
                <MdOutlineStarOutline key={index} className="text-gray-300 w-4 h-4" />
              );
            })}
          </div>
          {reviewCount > 0 ? (
            <>
              <span className="text-sm font-semibold text-gray-700">
                {averageRating.toFixed(1)}
              </span>
              <span className="text-xs text-gray-600">
                ({reviewCount})
              </span>
            </>
          ) : (
            <span className="text-xs text-gray-500 ml-1">Sin reseñas</span>
          )}
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <AddToCartBtn product={item} className="flex-grow" />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;