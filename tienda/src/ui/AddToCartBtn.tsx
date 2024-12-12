import { twMerge } from "tailwind-merge";
import { ProductProps } from "../../type";
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
  product?: ProductProps;
  showPrice?: boolean;
}) => {
  const [existingProduct, setExistingProduct] = useState<ProductProps | null>(null);
  const { addToCart, cartProduct, decreaseQuantity } = store();

  useEffect(() => {
    // Busca el producto en el carrito si existe
    const availableItem = cartProduct.find((item) => item?._id === product?._id);
    setExistingProduct(availableItem || null);
  }, [product, cartProduct]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product); // Agrega el producto al carrito
      toast.success(`${product?.name.substring(0, 10)} agregado exitosamente!`);
    } else {
      toast.error("Producto no está definido!");
    }
  };

  const handleDeleteProduct = () => {
    if (existingProduct) {
      if (existingProduct?.quantity > 1) {
        decreaseQuantity(existingProduct?._id); // Disminuye la cantidad
        toast.success(`${existingProduct?.name.substring(0, 10)} disminuido exitosamente`);
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
      return existingProduct?.regularPrice * existingProduct?.quantity;
    }
    return product?.regularPrice || 0;
  };

  const getDiscountedPrice = () => {
    // Si el producto está en el carrito, se multiplica por la cantidad
    if (existingProduct) {
      return existingProduct?.discountedPrice * existingProduct?.quantity;
    }
    return product?.discountedPrice || 0;
  };

  return (
    <>
      {showPrice && (
        <div>
          <PriceTag
            regularPrice={getRegularPrice()}
            discountedPrice={getDiscountedPrice()}
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
            {existingProduct?.quantity}
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
