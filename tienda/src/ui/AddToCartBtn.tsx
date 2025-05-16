import { twMerge } from "tailwind-merge";
import { Product } from "../../type";
import { store } from "../lib/store";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { FaMinus, FaPlus, FaShoppingCart, FaTrash } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import PriceTag from "./PriceTag";

const AddToCartBtn = ({
  className,
  title,
  product,
  showPrice = true,
}: {
  className?: string;
  title?: string;
  product?: Product;
  showPrice?: boolean;
}) => {
  const [existingProduct, setExistingProduct] = useState<Product | null>(null);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const { addToCart, cartProduct, decreaseQuantity, removeFromCart } = store();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isCartPage = location.pathname === "/carrito";

  useEffect(() => {
    const availableItem = cartProduct.find((item) => item?.idproducto === product?.idproducto);
    setExistingProduct(availableItem || null);
    setIsAddedToCart(!!availableItem);
  }, [product, cartProduct]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      toast.success(`${product?.nombreproducto.substring(0, 10)} agregado exitosamente!`, {
        icon: '🛍️',
        duration: 2000,
      });
      setIsAddedToCart(true);
    } else {
      toast.error("Producto no está definido!");
    }
  };

  const handleDeleteProduct = () => {
    if (existingProduct) {
      if (existingProduct.cantidad > 1) {
        decreaseQuantity(existingProduct.idproducto);
        toast.success(`${existingProduct.nombreproducto.substring(0, 10)} disminuido exitosamente`, {
          icon: '📉',
          duration: 2000,
        });
      } else {
        toast.error("No puedes disminuir menos de 1", {
          icon: '⚠️',
        });
      }
    }
  };

  const handleRemoveFromCart = () => {
    if (existingProduct) {
      removeFromCart(existingProduct.idproducto);
      toast.success(`${existingProduct.nombreproducto.substring(0, 10)} eliminado del carrito`, {
        icon: '🗑️',
        duration: 2000,
      });
      setIsAddedToCart(false);
      setExistingProduct(null);
    }
  };

  const handleGoToCart = () => {
    navigate("/carrito");
  };

  const newClassName = twMerge(
    "bg-[#efefef] uppercase text-xs py-3 text-center rounded-full font-semibold hover:bg-textoRojo hover:text-white hover:scale-105 duration-200 cursor-pointer",
    className
  );

  return (
    <div className="flex flex-col gap-3">
      {showPrice && (
        <div>
          <PriceTag
            precio={existingProduct ? existingProduct.lista2 * existingProduct.cantidad : product?.lista2 ?? 0}
            precioDescuento={existingProduct ? existingProduct.lista1 ?? 0 : product?.lista1 ?? 0}
          />
        </div>
      )}
      
      <div className="flex flex-col gap-2">
        {existingProduct ? (
          <>
            <div className="flex self-center items-center justify-center gap-2">
              <button
                onClick={handleDeleteProduct}
                className="bg-[#f7f7f7] text-textoRojo p-2 border-[1px] border-gray-200 hover:border-textoAmarillo rounded-full text-sm hover:bg-textoAmarillo duration-200 cursor-pointer"
                aria-label="Disminuir cantidad"
              >
                <FaMinus />
              </button>
              <p className="text-base font-semibold w-10 text-center">{existingProduct?.cantidad}</p>
              <button
                onClick={handleAddToCart}
                className="bg-[#f7f7f7] text-textoRojo p-2 border-[1px] border-gray-200 hover:border-textoAmarillo rounded-full text-sm hover:bg-textoAmarillo duration-200 cursor-pointer"
                aria-label="Aumentar cantidad"
              >
                <FaPlus />
              </button>
              <button
                onClick={handleRemoveFromCart}
                className="bg-[#f7f7f7] text-textoRojo p-2 border-[1px] border-gray-200 hover:bg-red-100 hover:border-red-300 hover:text-red-600 rounded-full text-sm duration-200 cursor-pointer ml-2"
                aria-label="Eliminar del carrito"
              >
                <FaTrash />
              </button>
            </div>
            {!isCartPage && (
              <button 
                onClick={handleGoToCart} 
                className="flex items-center justify-center gap-2 bg-textoRojo text-white py-3 px-4 rounded-full hover:bg-red-700 transition-all duration-200 text-sm font-medium"
              >
                <FaShoppingCart />
                Ver carrito
              </button>
            )}
          </>
        ) : isAddedToCart && !isCartPage ? (
          <button 
            onClick={handleGoToCart} 
            className={twMerge(
              newClassName, 
              "bg-textoRojo hover:bg-red-700 text-white flex items-center justify-center gap-2"
            )}
          >
            <FaShoppingCart className="text-base" />
            <span>Ir al carrito</span>
          </button>
        ) : (
          <button 
            onClick={handleAddToCart} 
            className={twMerge(newClassName, "flex items-center justify-center gap-2")}
          >
            <span>{title || "Agregar al carrito"}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default AddToCartBtn;