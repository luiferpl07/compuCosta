import { Link } from "react-router-dom";
import { Product } from "../../type";
import FormatoPrecio from "./FormatoPrecio";
import AddToCartBtn from "./AddToCartBtn";
import { IoClose } from "react-icons/io5";
import { store } from "../lib/store";
import toast from "react-hot-toast";
import { FaCheck, FaStar } from "react-icons/fa";
import { config } from "../../config"; 


const CartProduct = ({ product }: { product: Product }) => {
  const { removeFromCart } = store();

  const handleRemoveProduct = () => {
    if (product?.id) {
      removeFromCart(product.id);
      toast.success(`${product.nombre.substring(0, 20)} eliminado exitosamente!`);
    }
  };

  // Calcular puntuación promedio
  const averageRating = product?.reviews?.length
    ? product.reviews.reduce((acc, rev) => acc + rev.calificacion, 0) / product.reviews.length
    : 0;

  const mainImage = product?.imagenes?.find(img => img.es_principal)?.url  
    ? `${config?.baseUrl}${product.imagenes.find(img => img.es_principal)?.url}`
    : product?.imagenes?.[0]?.url  
      ? `${config?.baseUrl}${product.imagenes[0].url}`
      : 'ruta-a-imagen-por-defecto';

  const fallbackImageAlt = product?.imagenes[0]?.alt_text || `Imagen del producto ${product?.nombre}`;

  return (
    <div className="flex py-6 sm:py-10">
      <Link to={`/productos/${product.id}`}>
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
              {product.nombre}
            </h3>
            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, idx) => (
                <FaStar
                  key={idx}
                  className={`${idx < averageRating ? "text-yellow-400" : "text-gray-300"}`}
                />
              ))}
              <span className="text-sm text-gray-600">
                ({product.reviews?.length || 0} reseñas)
              </span>
            </div>
            <p className="text-xs">
              Marca: <span className="font-medium">{product?.marca?.nombre || "Sin marca"}</span>
            </p>
            <p className="text-xs">
              Categoría: <span className="font-medium">{product?.categorias[0]?.nombre || "Sin categoría"}</span>
            </p>
            <div className="flex items-center gap-6 mt-2">
              <p className="text-base font-semibold">
                <FormatoPrecio amount={product.precio * product.cantidad} />
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
          {product?.precioDescuento && (
            <p className="text-sm text-green-600">
              Ahorras <FormatoPrecio amount={product.precio - product.precioDescuento} />
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartProduct;
