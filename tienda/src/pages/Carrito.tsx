import { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { Trash2, Minus, Plus } from 'lucide-react';
import { store } from "../lib/store";
import CheckoutBtn from "../ui/CheckoutBtn";
import Container from "../ui/Container";
import FormatoPrecio from "../ui/FormatoPrecio";
import { getProductImage, getProductImageAlt } from "../../utils/imageUtils";
import toast from "react-hot-toast";

interface TotalAmount {
  regular: number;
  discounted: number;
  hasDiscounts: boolean;
}

const Carrito = () => {
  const [totalAmt, setTotalAmt] = useState<TotalAmount>({ 
    regular: 0, 
    discounted: 0,
    hasDiscounts: false
  });
  const { cartProduct, removeFromCart, currentUser, decreaseQuantity, addToCart } = store();

  useEffect(() => {
    const totals = cartProduct.reduce<TotalAmount>(
      (sum, product) => {
        const isLista2Active = product?.lista2_activa === true;
        const hasLista2Price = product?.lista2 && product.lista2 > 0;
        const showLista2 = isLista2Active && hasLista2Price;

        if (showLista2) {
          const regularSubtotal = product.lista2 * product.cantidad;
          const discountedSubtotal = product.lista1 * product.cantidad;
          sum.regular += regularSubtotal;
          sum.discounted += discountedSubtotal;
          sum.hasDiscounts = true;
        } else {
          const subtotal = product.lista1 * product.cantidad;
          sum.regular += subtotal;
          sum.discounted += subtotal;
        }
        return sum;
      },
      { regular: 0, discounted: 0, hasDiscounts: false }
    );
    setTotalAmt(totals);
  }, [cartProduct]);

  const handleRemoveProduct = (idproducto: string) => {
    removeFromCart(idproducto);
    toast.success(`Producto eliminado exitosamente!`);
  };

  const handleIncreaseQuantity = (product: any) => {
    addToCart(product);
  };

  const handleDecreaseQuantity = (idproducto: string) => {
    decreaseQuantity(idproducto);
  };

  return (
    <Container>
      {cartProduct.length > 0 ? (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-200">
            <h1 className="text-3xl font-normal text-gray-900">Tu carrito</h1>
            <Link
              to="/productos"
              className="text-sm text-red-600 hover:text-red-900 underline"
            >
              Seguir comprando
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {/* Lista de productos - ancho completo */}
            <div>
              
              {/* Headers de columnas - Solo desktop */}
              <div className="hidden lg:grid grid-cols-12 gap-4 pb-4 mb-4 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                <div className="col-span-5">Producto</div>
                <div className="col-span-4 text-center">Cantidad</div>
                <div className="col-span-3 text-right">Total</div>
              </div>

              {/* Productos */}
              <div className="space-y-6">
                {cartProduct.map((product) => {
                  const totalPrice = product.lista1 * product.cantidad;
                  const mainImage = getProductImage(product?.imagenes);
                  const fallbackImageAlt = getProductImageAlt(product?.imagenes, product?.nombreproducto);

                  return (
                    <div key={product.idproducto} className="grid grid-cols-1 lg:grid-cols-12 gap-4 pb-6 border-b border-gray-200">
                      
                      {/* Imagen y detalles del producto */}
                      <div className="lg:col-span-5 flex gap-4 items-center">
                        <Link to={`/productos/${product.slug || product.idproducto}`}>
                          <img
                            src={mainImage}
                            alt={fallbackImageAlt}
                            className="w-24 h-24 object-cover rounded border border-gray-200 hover:border-red-600 transition-colors"
                          />
                        </Link>
                        <div className="flex-1">
                          <Link to={`/productos/${product.slug || product.idproducto}`}>
                            <h3 className="text-sm font-normal text-gray-900 mb-1 hover:text-red-600 transition-colors">
                              {product.nombreproducto}
                            </h3>
                          </Link>
                          <p className="text-sm text-gray-500 mb-2">
                            <FormatoPrecio amount={product.lista1} />
                          </p>
                        </div>
                      </div>

                      {/* Cantidad */}
                      <div className="lg:col-span-4 flex items-center justify-center gap-4">
                        <div className="flex items-center border border-gray-300 rounded">
                          <button
                            onClick={() => handleDecreaseQuantity(product.idproducto)}
                            className="px-3 py-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
                            disabled={product.cantidad <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 py-2 text-center min-w-[3rem]">
                            {product.cantidad}
                          </span>
                          <button
                            onClick={() => handleIncreaseQuantity(product)}
                            className="px-3 py-2 hover:bg-gray-50 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        {/* Botón eliminar */}
                        <button
                          onClick={() => handleRemoveProduct(product.idproducto)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Total */}
                      <div className="lg:col-span-3 flex items-center justify-end">
                        <span className="text-base font-normal text-gray-900">
                          <FormatoPrecio amount={totalPrice} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total estimado - Abajo de los productos, alineado a la derecha */}
            <div className="flex justify-end border-t border-gray-200 pt-8">
              <div className="w-full lg:w-auto lg:min-w-[400px] space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-base font-medium text-gray-900">Total estimado</span>
                  <span className="text-xl font-normal text-gray-900">
                    <FormatoPrecio amount={totalAmt.discounted} /> COP
                  </span>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  Impuestos, descuentos y envío calculados en la pantalla de pago.
                </p>

                <CheckoutBtn products={cartProduct} currentUser={currentUser} />
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-3xl font-normal text-gray-900 mb-4">
              Tu carrito está vacío
            </h1>
            <p className="text-lg max-w-md text-center text-gray-600 mb-8">
              Actualmente no tienes productos en tu carrito. Agrega productos para comenzar a comprar.
            </p>
            <Link
              to="/productos"
              className="inline-block rounded-md px-8 py-3 text-base font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
            >
              Ir a comprar
            </Link>
          </div>
        </div>
      )}
    </Container>
  );
};

export default Carrito;