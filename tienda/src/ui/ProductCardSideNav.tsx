import { FaRegEye, FaRegStar, FaStar } from "react-icons/fa";
import { Product } from "../../type";
import { store } from "../lib/store";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Dialog, DialogPanel, DialogTitle, Transition } from "@headlessui/react";
import FormatoPrecio from "./FormatoPrecio";
import { getProductImage } from "../../utils/imageUtils";

const ProductCardSideNav = ({ product }: { product?: Product }) => {
  const { addToFavorite, favoriteProduct } = store();
  const [existingProduct, setExistingProduct] = useState<Product | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const availableItem = favoriteProduct.find(
      (item) => item?.idproducto === product?.idproducto
    );
    setExistingProduct(availableItem || null);
  }, [product, favoriteProduct]);

  const handleFavorite = () => {
    if (product) {
      addToFavorite(product).then(() => {
        toast.success(
          existingProduct
            ? `${product?.nombreproducto.substring(0, 10)} eliminado exitosamente!`
            : `${product?.nombreproducto.substring(0, 10)} agregado exitosamente!`
        );
      });
    }
  };

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  const averageRating = product?.reviews?.length
    ? product.reviews.reduce((acc, rev) => acc + rev.calificacion, 0) / product.reviews.length
    : 0;

  const mainImage = getProductImage(product?.imagenes);
  const fallbackImageAlt = product?.imagenes?.[0]?.alt_text || `Imagen del producto ${product?.nombreproducto}`;

  const isLista2Active = product?.lista2_activa === true;
  const hasLista2Price = product?.lista2 && product.lista2 > 0;
  const showLista2 = isLista2Active && hasLista2Price;

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

  const getMarcaDisplay = (marca: any) => {
    if (typeof marca === "string") return marca;

    if (Array.isArray(marca) && marca.length > 0) {
      if (marca[0]?.marca?.nombre) return marca[0].marca.nombre;
      if (typeof marca[0] === "string") return marca[0];
      if (marca[0]?.nombre) return marca[0].nombre;
    }

    return "Sin marca";
  };

  return (
    <div className="absolute right-1 top-1 flex flex-col gap-1 transition translate-x-12 group-hover:translate-x-0 duration-300">

      {/*  Favoritos  */}
      <span
        onClick={handleFavorite}
        className="w-11 h-11 inline-flex text-textoRojo text-lg items-center justify-center rounded-full hover:text-white hover:bg-textoAmarillo duration-200"
        title={existingProduct ? "Quitar de favoritos" : "Agregar a favoritos"}
      >
        {existingProduct ? <FaStar /> : <FaRegStar />}
      </span>

     
      {/*  Vista rápida  */}
      <span
        onClick={open}
        className="w-11 h-11 inline-flex text-textoRojo text-lg items-center justify-center rounded-full hover:text-white hover:bg-textoAmarillo duration-200"
        title="Vista rápida"
      >
        <FaRegEye />
      </span>

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
                  {product && (
                    <div className="flex flex-col gap-4">
                      <div className="h-48 w-full overflow-hidden rounded-md">
                        <img
                          src={mainImage}
                          alt={fallbackImageAlt}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{product?.nombreproducto}</h3>
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
                          Marca:{" "}
                          <span className="font-medium">
                            {getMarcaDisplay(product?.marca)}
                          </span>
                        </p>

                        <p className="text-sm mt-1">
                          Categoría:{" "}
                          <span className="font-medium">
                            {getCategoriesDisplay(product?.categorias)}
                          </span>
                        </p>

                        <div className="flex flex-col gap-2 mt-4">
                          {showLista2 && product.lista2 > product.lista1 ? (
                            <div className="flex items-center gap-2">
                              <p className="text-lg font-semibold text-green-600">
                                <FormatoPrecio amount={product.lista1} />
                              </p>
                              <p className="text-sm text-gray-500 line-through">
                                <FormatoPrecio amount={product.lista2} />
                              </p>
                              <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                ¡Oferta!
                              </span>
                            </div>
                          ) : (
                            <p className="text-lg font-semibold text-gray-900">
                              <FormatoPrecio amount={product.lista1} />
                            </p>
                          )}
                        </div>

                        <div className="mt-4">
                          {product?.cantidad ? (
                            <p className="text-sm text-green-500">En Stock</p>
                          ) : (
                            <p className="text-sm text-red-500">Agotado</p>
                          )}
                        </div>

                        {showLista2 && product.lista2 > product.lista1 && (
                          <p className="text-sm text-green-600 mt-2 bg-green-50 p-2 rounded-md">
                            🎉 Ahorras <FormatoPrecio amount={product.lista2 - product.lista1} />
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