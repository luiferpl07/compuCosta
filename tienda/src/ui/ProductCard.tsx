import { MdOutlineStarOutline } from "react-icons/md";
import { ProductProps } from "../../type";
import AddToCartBtn from "./AddToCartBtn";
import { useState } from "react";
import {
  Button,
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import FormattedPrice from "./FormatoPrecio";
import ProductCardSideNav from "./ProductCardSideNav";
import { useNavigate } from "react-router-dom";

interface Props {
  item: ProductProps;
  setSearchText?: (value: string) => void; // Aseguramos el tipo
}

const ProductCard = ({ item, setSearchText }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigation = useNavigate();

  // Abrir y cerrar modal
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  // Cálculo del porcentaje de descuento con validación
  const percentage =
    item?.regularPrice && item?.discountedPrice
      ? ((item.regularPrice - item.discountedPrice) / item.regularPrice) * 100
      : 0;

  // Navegación al producto
  const handleProduct = () => {
    navigation(`/productos/${item?._id}`);
    setSearchText?.(""); // Aseguramos que setSearchText sea una función antes de llamarla
  };

  return (
    <div className="border border-gray-200 rounded-lg p-1 overflow-hidden hover:border-amber-300  duration-200 cursor-pointer">
      {/* Imagen del producto y modal de descuento */}
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
          src={item?.images[0]}
          alt="Imagen del producto"
          className="w-full h-full rounded-md object-cover group-hover:scale-110 duration-300"
        />
        <ProductCardSideNav product={item} />
      </div>

      {/* Información del producto */}
      <div className="flex flex-col gap-2 px-2 pb-2">
        <h3 className="text-xs uppercase font-semibold text-textoBlanco/50">
          {item?.overView}
        </h3>
        <h2 className="text-lg font-bold line-clamp-2">{item?.name}</h2>
        <div className="text-base text-textoBlanco/50 flex items-center">
          <MdOutlineStarOutline />
          <MdOutlineStarOutline />
          <MdOutlineStarOutline />
          <MdOutlineStarOutline />
          <MdOutlineStarOutline />
        </div>
        <AddToCartBtn product={item} />
      </div>

      {/* Modal de ahorro */}
      <Transition appear show={isOpen}>
        <Dialog
          as="div"
          className="relative z-10 focus:outline-none"
          onClose={close}
          aria-label="Detalle del descuento"
        >
          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <TransitionChild
                enter="ease-out duration-300"
                enterFrom="opacity-0 transform-[scale(95%)]"
                enterTo="opacity-100 transform-[scale(100%)]"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 transform-[scale(100%)]"
                leaveTo="opacity-0 transform-[scale(95%)]"
              >
                <DialogPanel className="w-full max-w-md rounded-xl bg-black backdrop-blur-2xl z-50 p-6">
                  <DialogTitle
                    as="h3"
                    className="text-base/7 font-medium text-whiteText"
                  >
                    ¡Date prisa!
                  </DialogTitle>
                  <p className="mt-2 text-sm/6 text-white/50">
                    Vas a ahorrar{" "}
                    <span className="text-textAzulclaro">
                      <FormattedPrice
                        amount={item?.regularPrice - item?.discountedPrice}
                      />
                    </span>{" "}
                    con este producto.
                  </p>
                  <p className="text-sm/6 text-white/50">
                    Aprovecha esta increíble oferta antes de que termine.
                  </p>
                  <div className="mt-4">
                    <Button
                      className="inline-flex items-center gap-2 rounded-md bg-gray-700 py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-gray-600 data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white"
                      onClick={close}
                    >
                      ¡Entendido, gracias!
                    </Button>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default ProductCard;
