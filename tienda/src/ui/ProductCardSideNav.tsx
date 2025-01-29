import { FaRegEye, FaRegStar, FaStar } from "react-icons/fa";
import { LuArrowLeftRight } from "react-icons/lu";
import { Product } from "../../type";
import { store } from "../lib/store";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Dialog, DialogPanel, DialogTitle, Transition } from "@headlessui/react";
import FormatoPrecio from "./FormatoPrecio";
import { config } from "../../config"; 

const ProductCardSideNav = ({ product }: { product?: Product }) => {
  const { addToFavorite, favoriteProduct } = store();
  const [existingProduct, setExistingProduct] = useState<Product | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const availableItem = favoriteProduct.find(
      (item) => item?.id === product?.id
    );
    setExistingProduct(availableItem || null);
  }, [product, favoriteProduct]);

  const handleFavorite = () => {
    if (product) {
      addToFavorite(product).then(() => {
        toast.success(
          existingProduct
            ? `${product?.nombre.substring(0, 10)} eliminado exitosamente!`
            : `${product?.nombre.substring(0, 10)} agregado exitosamente!`
        );
      });
    }
  };

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  // Calcular la puntuación promedio de las reseñas
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
    <div className="absolute right-1 top-1 flex flex-col gap-1 transition translate-x-12 group-hover:translate-x-0 duration-300">
      <span
        onClick={handleFavorite}
        className="w-11 h-11 inline-flex text-textoRojo text-lg items-center justify-center rounded-full hover:text-white hover:bg-textoAmarillo duration-200"
        title={existingProduct ? "Quitar de favoritos" : "Agregar a favoritos"}
      >
        {existingProduct ? <FaStar /> : <FaRegStar />}
      </span>
      <span
        className="w-11 h-11 inline-flex text-textoRojo text-lg items-center justify-center rounded-full hover:text-white hover:bg-textoAmarillo duration-200"
        title="Comparar producto"
      >
        <LuArrowLeftRight />
      </span>
      <span
        onClick={open} // Activar el modal de vista rápida
        className="w-11 h-11 inline-flex text-textoRojo text-lg items-center justify-center rounded-full hover:text-white hover:bg-textoAmarillo duration-200"
        title="Vista rápida"
      >
        <FaRegEye />
      </span>

      {/* Modal de Vista Rápida */}
      <Transition appear show={isOpen}>
        <Dialog
          as="div"
          className="relative z-10 focus:outline-none"
          onClose={close}
        >
          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <DialogPanel className="w-full max-w-md rounded-xl bg-white p-6">
                <DialogTitle as="h3" className="text-xl font-semibold text-black">
                  Vista rápida
                </DialogTitle>
                <div className="mt-4">
                  {/* Aquí renderizamos los detalles del producto */}
                  {product && (
                    <div className="flex flex-col gap-4">
                      <img
                        src={mainImage}
                        alt={fallbackImageAlt}
                        className="h-48 w-full rounded-md object-cover object-center"
                      />
                      <div>
                        <h3 className="text-lg font-semibold">{product?.nombre}</h3>
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
                        <p className="text-sm mt-2">
                          Marca: <span className="font-medium">{product?.marca?.nombre || "Sin marca"}</span>
                        </p>
                        <p className="text-sm mt-1">
                          Categoría: <span className="font-medium">{product?.categorias[0]?.nombre || "Sin categoría"}</span>
                        </p>
                        <div className="flex mt-4">
                          <p className="text-lg font-semibold">
                            <FormatoPrecio amount={product.precio} />
                          </p>
                        </div>
                        <div className="mt-4">
                          {product?.enStock ? (
                            <p className="text-sm text-green-500">En Stock</p>
                          ) : (
                            <p className="text-sm text-red-500">Agotado</p>
                          )}
                        </div>
                        {product?.precioDescuento && (
                          <p className="text-sm text-green-600 mt-2">
                            Ahorras <FormatoPrecio amount={product.precio - product.precioDescuento} />
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={close}
                  className="mt-4 w-full bg-textoRojo text-white py-2 rounded-md"
                >
                  Cerrar
                </button>
              </DialogPanel>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default ProductCardSideNav;
