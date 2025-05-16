import { useEffect, useState } from 'react';
import { FaQuestionCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import { store } from "../lib/store";
import CartProduct from "../ui/CartProduct";
import CheckoutBtn from "../ui/CheckoutBtn";
import Container from "../ui/Container";
import FormatoPrecio from "../ui/FormatoPrecio";

interface TotalAmount {
  regular: number;
  discounted: number;
}

const Carrito = () => {
  const [totalAmt, setTotalAmt] = useState<TotalAmount>({ 
    regular: 0, 
    discounted: 0
  });
  const { cartProduct, currentUser } = store();

  const shippingAmt = 25;

  useEffect(() => {
    const totals = cartProduct.reduce<TotalAmount>(
      (sum, product) => {
        const regularSubtotal = product?.lista2 * product?.cantidad;
        const discountedSubtotal = product?.lista1 * product?.cantidad;

        sum.regular += regularSubtotal;
        sum.discounted += discountedSubtotal;
        
        return sum;
      },
      { regular: 0, discounted: 0 }
    );
    setTotalAmt(totals);
  }, [cartProduct]);

  return (
    <Container>
      {cartProduct.length > 0 ? (
        <>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Carrito de compras
          </h1>

          <div className="mt-10 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
            <section className="lg:col-span-7">
              <div className="divide-y divide-gray-200 border-b border-t border-gray-200">
                {cartProduct.map((product) => (
                  <CartProduct product={product} key={product?.idproducto} />
                ))}
              </div>
            </section>
            <section className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
              <h2 className="text-lg font-medium text-red-600">
                Resumen del pedido
              </h2>
              <dl className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <dt className="text-base font-medium text-gray-900">Subtotal</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    <FormatoPrecio amount={totalAmt?.regular} />
                  </dd>
                </div>
               
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <dt className="text-base font-medium text-gray-900">
                    Descuento Total
                  </dt>
                  <dd className="text-base font-medium text-gray-500">
                    <FormatoPrecio
                      amount={totalAmt?.regular - totalAmt?.discounted}
                    />
                  </dd>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <dt className="text-base font-medium text-gray-900">
                    Total de pedidos
                  </dt>
                  <dd className="text-lg font-bold text-gray-900">
                    <FormatoPrecio
                      amount={totalAmt?.discounted + shippingAmt}
                    />
                  </dd>
                </div>
              </dl>
              <CheckoutBtn products={cartProduct} />
            </section>
          </div>
        </>
      ) : (
        <div className="bg-white h-96 flex flex-col gap-2 items-center justify-center py-5 rounded-lg border border-gray-200 drop-shadow-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Carrito de compras
          </h1>
          <p className="text-lg max-w-[600px] text-center text-gray-600 tracking-wide leading-6">
            Actualmente no tienes productos en tu carrito. Agrega productos para comenzar a comprar.
          </p>
          <Link
            to={"/productos"}
            className="w-full mt-2 rounded-md border border-transparent px-8 py-3 text-base font-medium text-red-500 bg-gray-100 sm:w-auto hover:bg-textoRojo hover:text-white duration-200"
          >
            Ir a comprar
          </Link>
        </div>
      )}
    </Container>
  );
};

export default Carrito;
