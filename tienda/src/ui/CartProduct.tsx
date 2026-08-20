import { Link } from "react-router-dom";
import { Product } from "../../type";
import FormatoPrecio from "./FormatoPrecio";
import AddToCartBtn from "./AddToCartBtn";
import { IoClose } from "react-icons/io5";
import { store } from "../lib/store";
import toast from "react-hot-toast";
import { FaCheck } from "react-icons/fa";
import { MdStar, MdStarHalf, MdOutlineStarOutline } from "react-icons/md";
import { getProductImage, getProductImageAlt } from "../../utils/imageUtils";
import PriceTag from "./PriceTag";

const CartProduct = ({ product }: { product: Product }) => {
  const { removeFromCart } = store();

  const handleRemoveProduct = () => {
    if (product?.idproducto) {
      removeFromCart(product.idproducto);
      toast.success(`${product.nombreproducto.substring(0, 20)} eliminado exitosamente!`);
    }
  };

  const averageRating = product?.reviews?.length
    ? (product.reviews.reduce((acc, rev) => acc + rev.calificacion, 0) / product.reviews.length).toFixed(1)
    : "0.0";

  const mainImage = getProductImage(product?.imagenes);
  const fallbackImageAlt = getProductImageAlt(product?.imagenes, product?.nombreproducto);

  // ✅ ACTUALIZADO: Lógica automática - activar Lista2 si hay descuento real
  const isLista2Active = product?.lista2_activa === true;
  const hasLista2Price = product?.lista2 && product.lista2 > 0;
  const showLista2 = isLista2Active && product?.lista2 && product.lista2 > 0;

  // Función para obtener SOLO la categoría más específica (subcategoría)
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
      if (item.categoria) {
        return item.categoria;
      } else if (item.nombre) {
        return item;
      }
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

    if (subcategorias.length > 0) {
      return subcategorias.map(cat => cat.nombre).join(", ");
    }

    if (categoriasPadre.length > 0) {
      return categoriasPadre.map(cat => cat.nombre).join(", ");
    }

    return "Sin categoría";
  };

  const getMarcaDisplay = (marca: any) => {
    if (typeof marca === "string") {
      return marca;
    }

    if (Array.isArray(marca) && marca.length > 0) {
      if (marca[0]?.marca?.nombre) {
        return marca[0].marca.nombre;
      }
      if (typeof marca[0] === "string") {
        return marca[0];
      }
      if (marca[0]?.nombre) {
        return marca[0].nombre;
      }
    }

    return "Sin marca";
  };

  return (
    <div className="flex py-6 sm:py-10">
      <Link to={`/productos/${product.slug || product.idproducto}`}>
        <img
          src={mainImage}
          alt={fallbackImageAlt}
          className="h-24 w-24 rounded-md object-cover object-center sm:h-48 sm:w-48 border border-skyText/30 hover:border-skyText duration-300"
        />
      </Link>

      <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
        <div className="relative pr-9 sm:grid sm:grid-cols-4 sm:gap-x-6 sm:pr-0">
          <div className="flex flex-col gap-1 col-span-3">
            <h3 className="text-base font-semibold w-full">
              {product.nombreproducto}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">{averageRating}</span>
              <div className="flex items-center">
                {[...Array(5)].map((_, index) => {
                  const ratingValue = index + 1;
                  const isHalfStar = parseFloat(averageRating) - index > 0 && parseFloat(averageRating) - index < 1;
                  const isFullStar = parseFloat(averageRating) >= ratingValue;
                  
                  return isFullStar ? (
                    <MdStar key={index} className="text-yellow-400" />
                  ) : isHalfStar ? (
                    <MdStarHalf key={index} className="text-yellow-400" />
                  ) : (
                    <MdOutlineStarOutline key={index} className="text-gray-300" />
                  );
                })}
              </div>
              <span className="text-sm text-gray-600">
                ({product.reviews?.length || 0} reseñas)
              </span>
            </div>
            <p>Marca: <span className="font-medium">
              {getMarcaDisplay(product?.marca)}
            </span></p>
            <p>Categoría: <span className="font-medium">
              {getCategoriesDisplay(product?.categorias)}
            </span></p>
            
            {/* ✅ PRECIOS LIMPIOS: Sin ofertas, ahorros ni debug */}
            <div className="flex flex-col gap-2 mt-2">              
              <div className="text-base font-semibold">
                {showLista2 && product.lista2 > product.lista1 ? (
                  // Solo mostrar precio con descuento cuando hay descuento real
                  <span className="text-lg font-bold text-red-600">
                    <FormatoPrecio amount={product.lista1 * (product.cantidad || 1)} />
                  </span>
                ) : (
                  // Mostrar solo el precio normal cuando no hay descuento
                  <span className="text-lg font-bold text-red-600">
                    <FormatoPrecio amount={product.lista1 * (product.cantidad || 1)} />
                  </span>
                )}
              </div>
              
              {/* ✅ PRECIO UNITARIO: Solo cuando hay descuento */}
              <div className="text-sm text-gray-600">
                Precio unitario:
                {product?.lista2_activa === true && product.lista2 ? (
                  <>
                    <span className="line-through text-gray-500 ml-1">
                      <FormatoPrecio amount={product.lista2} />
                    </span>
                    {' '}
                    <span className="font-semibold text-gray-900">
                      <FormatoPrecio amount={product.lista1} />
                    </span>
                  </>
                ) : (
                  <span className="font-semibold text-gray-900 ml-1">
                    <FormatoPrecio amount={product.lista1} />
                  </span>
                )}
              </div>
              
              <AddToCartBtn product={product} showPrice={false} />
            </div>
          </div>
          <div className="mt-4 sm:mt-0 sm:pr-9">
            <button
              onClick={handleRemoveProduct}
              className="-m2 inline-flex p-2 text-gray-600 hover:text-red-600"
            >
              <IoClose className="text-xl" />
            </button>
          </div>
        </div>

        <div>
          {product?.enStock && (
            <p className="mt-4 flex space-x-2 text-sm text-gray-700">
              <FaCheck className="text-lg text-green-500" />
              <span>En Stock</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartProduct;