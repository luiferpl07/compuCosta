import { twMerge } from "tailwind-merge";
import { Product } from "../../type";
import { store } from "../lib/store";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { FaMinus, FaPlus, FaShoppingCart, FaTrash } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import PriceTag from "./PriceTag";
import FormatoPrecio from "./FormatoPrecio";

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

  // ✅ NUEVO: Verificar si Lista 2 está activa
  const isLista2Active = product?.lista2_activa === true;
  const hasLista2Price = product?.lista2 && product.lista2 > 0;
  const showLista2 = isLista2Active && hasLista2Price;

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
    <div className="flex flex-col gap-3 w-full">
      {/* ✅ SECCIÓN DE PRECIO - Mantiene el estilo original */}
      {showPrice && (
        <div>
          {/* ✅ ACTUALIZADO: Solo mostrar PriceTag si Lista 2 está activa y hay descuento real */}
          {showLista2 && existingProduct ? (
            <PriceTag
              precio={existingProduct.lista2 * existingProduct.cantidad}
              precioDescuento={existingProduct.lista1 * existingProduct.cantidad}
            />
          ) : showLista2 && product ? (
            <PriceTag
              precio={product.lista2}
              precioDescuento={product.lista1}
            />
          ) : (
            // Mostrar precio simple cuando Lista 2 no está activa o no hay descuento real
            <div className="text-lg font-bold text-gray-900">
              <FormatoPrecio 
                amount={existingProduct 
                  ? existingProduct.lista1 * existingProduct.cantidad 
                  : product?.lista1 ?? 0
                } 
              />
            </div>
          )}
        </div>
      )}
      
      {/* ✅ SECCIÓN DE BOTONES - Siempre centrada independientemente del precio */}
      <div className="w-full flex flex-col gap-2 items-center justify-center">
        {existingProduct ? (
          <>
            {/* Controles de cantidad - centrados */}
            <div className="flex items-center justify-center gap-2">
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
            
            {/* Botón "Ver carrito" - centrado y con ancho completo */}
            {!isCartPage && (
              <button 
                onClick={handleGoToCart} 
                className="flex items-center justify-center gap-2 bg-textoRojo text-white py-3 px-4 rounded-full hover:bg-red-700 transition-all duration-200 text-sm font-medium w-full"
              >
                <FaShoppingCart />
                Ver carrito
              </button>
            )}
          </>
        ) : isAddedToCart && !isCartPage ? (
          // Botón "Ir al carrito" - centrado y con ancho completo
          <button 
            onClick={handleGoToCart} 
            className={twMerge(
              newClassName, 
              "bg-textoRojo hover:bg-red-700 text-white flex items-center justify-center gap-2 w-full"
            )}
          >
            <FaShoppingCart className="text-base" />
            <span>Ir al carrito</span>
          </button>
        ) : (
          // Botón "Agregar al carrito" - centrado y con ancho completo
          <button 
            onClick={handleAddToCart} 
            className={twMerge(newClassName, "flex items-center justify-center gap-2 w-full")}
          >
            <span>{title || "Agregar al carrito"}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default AddToCartBtn;