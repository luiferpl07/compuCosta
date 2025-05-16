import { MdClose } from "react-icons/md";
import { Product } from "../../type";
import { store } from "../lib/store";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AddToCartBtn from "./AddToCartBtn";
import FormatoPrecio from "./FormatoPrecio";
import { getProductImage, getProductImageAlt } from "../../utils/imageUtils";


const FavoriteProduct = ({ product }: { product: Product }) => {
  const { removeFromFavorite } = store();
  const navigate = useNavigate();

  const handleRemoveFromFavorite = () => {
    removeFromFavorite(product.idproducto);
    toast.success("Eliminado de favoritos con éxito!");
  };

  // Obtener la imagen principal de forma segura
  const mainImage = getProductImage(product?.imagenes);
  const fallbackImageAlt = getProductImageAlt(product?.imagenes, product?.nombreproducto);




  const ahorro = product.lista2  - product.lista1 ;

  return (
    <div className="flex py-6">
      <div className="min-w-0 flex-1 lg:flex lg:flex-col">
        <div className="lg:flex-1">
          <div className="sm:flex">
            <div>
              <h4 className="font-medium text-gray-900">{product.nombreproducto}</h4>
              <p className="mt-2 hidden text-sm text-gray-500 sm:block">
                {product.caracteristica || product.descripcion}
              </p>
              <p className="text-sm mt-1">
                Marca:{" "}
                <span className="font-medium">
                  {typeof product?.marca === "string" && product.marca !== null
                    ? product.marca
                    : "Sin marca"}
                </span>
              </p>
              <p className="text-sm mt-1">
                Categoría:{" "}
                <span className="font-medium">
                    {typeof product?.categorias === "string" && product.categorias !== null
                                ? product.categorias
                                : "Sin categoría"}
                  </span>
              </p>
            </div>
            <span
              onClick={handleRemoveFromFavorite}
              className="text-lg text-gray-600 hover:text-red-600 duration-200 cursor-pointer inline-block mt-4 sm:mt-0"
            >
              <MdClose />
            </span>
          </div>
          <div className="flex text-sm items-center gap-6 font-medium py-4">
            <AddToCartBtn product={product} className="w-32" />
          </div>
        </div>
        {ahorro > 0 && (
          <p>
            Estás ahorrando{" "}
            <span className="text-sm font-semibold text-green-500">
              <FormatoPrecio amount={ahorro} />
            </span>{" "}
            al comprar
          </p>
        )}
      </div>
      <div
        onClick={() => navigate(`/productos/${product.idproducto}`)}
        className="ml-4 flex-shrink-0 h-20 w-20 sm:w-40 sm:h-40 sm:order-first sm:m-0 sm:mr-6 border border-gray-200 rounded-md hover:border-skyText duration-200 cursor-pointer group overflow-hidden"
      >
        <img
          src={mainImage}
          alt={fallbackImageAlt}
          className="h-full w-full rounded-lg object-cover object-center group-hover:scale-110 duration-200"
        />
      </div>
    </div>
  );
};

export default FavoriteProduct;
