import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
import { OrderTypes, ProductProps } from "../../type";
import { db } from "../lib/firebase";
import { store } from "../lib/store";
import Container from "../ui/Container";
import FormatoPrecio from "../ui/FormatoPrecio";
import Loading from "../ui/Loading";

const Pedidos = () => {
  const { currentUser } = store();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "orders", currentUser?.email!);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const orderData = docSnap?.data()?.orders;
          setOrders(orderData);
        } else {
          console.log("¡Aún no tienes pedidos!");
        }
      } catch (error) {
        console.log("Error al obtener datos", error);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  return (
    <Container>
      {loading ? (
        <Loading />
      ) : orders?.length > 0 ? (
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mt-1">Detalles de los pedidos</h2>
          <p className="text-gray-600">
            Nombre del cliente:{" "}
            <span className="text-black font-semibold">
              {currentUser?.firstName} {currentUser?.lastName}
            </span>
          </p>
          <p className="text-gray-600">
            Total de pedidos:{" "}
            <span className="text-black font-semibold">{orders?.length}</span>
          </p>
          <p className="text-sm max-w-[600px] tracking-wide text-gray-500">
            A continuación, se muestran los detalles de tus pedidos realizados
            en nuestra tienda.
          </p>
          <div className="flex flex-col gap-3">
            <div className="space-y-6 divide-y divide-gray-900/10">
              {orders?.map((order: OrderTypes) => {
                const totalAmt = order?.orderItems.reduce(
                  (acc, item) =>
                    acc + (item?.discountedPrice * item?.quantity || 0),
                  0
                );
                return (
                  <Disclosure as="div" key={order?.paymentId} className="pt-6">
                    {({ open }) => (
                      <>
                        <dt>
                          <DisclosureButton className="flex w-full items-center justify-between text-left text-gray-900">
                            <span className="text-base font-semibold leading-7">
                              Número de seguimiento:{" "}
                              <span className="font-normal">
                                {order?.paymentId}
                              </span>
                            </span>
                            <span>{open ? <FaMinus /> : <FaPlus />}</span>
                          </DisclosureButton>
                        </dt>
                        <DisclosurePanel as="dd" className="mt-5 pr-12">
                          <div className="flex flex-col gap-2 bg-[#f4f4f480] p-5 border border-gray-200">
                            <p className="text-base font-semibold">
                              Tu pedido{" "}
                              <span className="text-skyText">
                                #{order?.paymentId.substring(0, 20)}...
                              </span>{" "}
                              ha sido enviado y llegará pronto.
                            </p>
                            <div className="flex flex-col gap-1">
                              <p className="text-gray-600">
                                Cantidad de artículos en el pedido:{" "}
                                <span className="text-black font-medium">
                                  {order?.orderItems?.length}
                                </span>
                              </p>
                              <p className="text-gray-600">
                                Estado del pago:{" "}
                                <span className="text-black font-medium">
                                  Pagado con Wompi
                                </span>
                              </p>
                              <p className="text-gray-600">
                                Monto del pedido:{" "}
                                <span className="text-black font-medium">
                                  <FormatoPrecio amount={totalAmt} />
                                </span>
                              </p>
                            </div>
                            {order?.orderItems?.map((item: ProductProps) => (
                              <div
                                key={item?._id}
                                className="flex space-x-6 border-b border-gray-200 py-3"
                              >
                                <Link
                                  to={`/productos/${item?._id}`}
                                  className="h-20 w-20 flex-none sm:h-40 sm:w-40 rounded-lg bg-gray-100 border border-gray-300 hover:border-skyText overflow-hidden"
                                >
                                  <img
                                    src={item?.images[0]}
                                    alt="Imagen del producto"
                                    className="h-full w-full object-cover object-center hover:scale-110 duration-300"
                                  />
                                </Link>
                                <div className="flex flex-auto flex-col">
                                  <div>
                                    <Link
                                      to={`/productos/${item?._id}`}
                                      className="font-medium text-gray-900"
                                    >
                                      {item?.name}
                                    </Link>
                                    <p className="mt-2 text-sm text-gray-900">
                                      {item?.description}
                                    </p>
                                  </div>
                                  <div className="mt-6 flex flex-1 items-end">
                                    <dl className="flex space-x-4 divide-x divide-gray-200 text-sm sm:space-x-6">
                                      <div className="flex">
                                        <dt className="font-medium text-gray-900">
                                          Cantidad
                                        </dt>
                                        <dd className="ml-2 text-gray-700">
                                          {item?.quantity}
                                        </dd>
                                      </div>
                                      <div className="flex pl-4 sm:pl-6">
                                        <dt className="text-black font-bold">
                                          Precio
                                        </dt>
                                        <dd className="ml-2 text-gray-700">
                                          <span className="text-black font-bold">
                                            <FormatoPrecio
                                              amount={item?.discountedPrice}
                                            />
                                          </span>
                                        </dd>
                                      </div>
                                      <div className="flex pl-4 sm:pl-6">
                                        <dt className="font-medium text-gray-900">
                                          Subtotal
                                        </dt>
                                        <dd className="ml-2 text-gray-700">
                                          <span className="text-black font-bold">
                                            <FormatoPrecio
                                              amount={
                                                item?.discountedPrice *
                                                item?.quantity
                                              }
                                            />
                                          </span>
                                        </dd>
                                      </div>
                                    </dl>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </DisclosurePanel>
                      </>
                    )}
                  </Disclosure>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <p className="text-2xl font-semibold">Aún no tienes pedidos</p>
          <p>No has realizado ninguna compra con nosotros</p>
          <Link
            to={"/productos"}
            className="mt-2 bg-gray-800 text-gray-100 px-6 py-2 rounded-md hover:bg-black hover:text-white duration-200"
          >
            Ir a comprar
          </Link>
        </div>
      )}
    </Container>
  );
};

export default Pedidos;
