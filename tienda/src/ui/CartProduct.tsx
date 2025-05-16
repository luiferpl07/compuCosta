import { Link } from "react-router-dom";
import { Product } from "../../type";
import FormatoPrecio from "./FormatoPrecio";
import AddToCartBtn from "./AddToCartBtn";
import { IoClose } from "react-icons/io5";
import { store } from "../lib/store";
import toast from "react-hot-toast";
import { FaCheck } from "react-icons/fa";
import { MdStar, MdStarHalf, MdOutlineStarOutline } from "react-icons/md"; // Importa los iconos correctos
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

  return (
    <div className="flex py-6 sm:py-10">
      <Link to={`/productos/${product.idproducto}`}>
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
              {typeof product?.marca === "string" && product.marca !== null
                ? product.marca
                : "Sin marca"}
            </span></p>
            <p>Categoría: <span className="font-medium">
              {typeof product?.categorias === "string" && product.categorias !== null
                ? product.categorias
                : "Sin categoría"}
            </span></p>
            <div className="flex items-center gap-6 mt-2">
              <p className="text-base font-semibold">
                <PriceTag precio={product.lista2} precioDescuento={product.lista1} className="text-lg" />
              </p>
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
          {product?.lista2 && (
            <p className="text-sm text-green-600">
              Ahorras <FormatoPrecio amount={product.lista2 - product.lista1} />
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartProduct;