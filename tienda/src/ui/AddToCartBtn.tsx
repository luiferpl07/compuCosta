import { twMerge } from "tailwind-merge";
import { Product } from "../../type";
import { store } from "../lib/store";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
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
  const { addToCart, cartProduct, decreaseQuantity } = store();

  useEffect(() => {
    // Busca el producto en el carrito si existe
    const availableItem = cartProduct.find((item) => item?.id === product?.id);
    setExistingProduct(availableItem || null);
  }, [product, cartProduct]);

  const handleAddToCart = () => {
    if (product) {
      // Solo agregamos el producto, la cantidad se maneja en el store
      addToCart(product);  
      toast.success(`${product?.nombre.substring(0, 10)} agregado exitosamente!`);
    } else {
      toast.error("Producto no está definido!");
    }
  };
  
  const handleDeleteProduct = () => {
    if (existingProduct) {
      if (existingProduct.cantidad > 1) {
        decreaseQuantity(existingProduct.id);  // Disminuir la cantidad en el carrito
        toast.success(`${existingProduct.nombre.substring(0, 10)} disminuido exitosamente`);
      } else {
        toast.error("No puedes disminuir menos de 1");
      }
    }
  };
  

  const newClassName = twMerge(
    "bg-[#efefef] uppercase text-xs py-3 text-center rounded-full font-semibold hover:bg-textoRojo hover:text-white hover:scale-105 duration-200 cursor-pointer",
    className
  );

  const getRegularPrice = () => {
    // Si el producto está en el carrito, se multiplica por la cantidad
    if (existingProduct) {
      return existingProduct.precio * existingProduct.cantidad;
    }
    return product?.precio ?? 0; // Usamos el valor de precio o 0 si es undefined
  };
  
const getDiscountedPrice = () => {
  if (existingProduct) {
    // Verificar que precioDescuento no es undefined
    return existingProduct.precioDescuento ?? 0; 
  }
  return product?.precioDescuento ?? 0;
};

  return (
    <>
      {showPrice && (
        <div>
          <PriceTag
            precio={getRegularPrice()}
            precioDescuento={getDiscountedPrice()}
          />
        </div>
      )}
      {existingProduct ? (
        <div className="flex self-center items-center justify-center gap-2">
          <button
            onClick={handleDeleteProduct}
            className="bg-[#f7f7f7] text-textoRojo p-2 border-[1px] border-gray-200 hover:border-textoAmarillo rounded-full text-sm hover:bg-textoAmarillo duration-200 cursor-pointer"
          >
            <FaMinus />
          </button>
          <p className="text-base font-semibold w-10 text-center">
            {existingProduct?.cantidad}
          </p>
          <button
            onClick={handleAddToCart}
            className="bg-[#f7f7f7] text-textoRojo p-2 border-[1px] border-gray-200 hover:border-textoAmarillo rounded-full text-sm hover:bg-textoAmarillo duration-200 cursor-pointer"
          >
            <FaPlus />
          </button>
        </div>
      ) : (
        <button onClick={handleAddToCart} className={newClassName}>
          {title ? title : "Agregar al carrito"}
        </button>
      )}
    </>
  );
};

export default AddToCartBtn;
