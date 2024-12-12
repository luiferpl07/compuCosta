import { Link, useLocation, useNavigate } from "react-router-dom";
import { store } from "../lib/store";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { arrayUnion, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import Container from "../ui/Container";
import Loading from "../ui/Loading";
import axios from "axios"; 

const Success = () => {
  const { currentUser, cartProduct, resetCart } = store();
  const location = useLocation();
  const transactionId = new URLSearchParams(location.search).get("transactionId");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!transactionId) {
      navigate("/");
    } else if (cartProduct.length > 0) {
      const saveOrder = async () => {
        try {
          setLoading(true);

          // Verificar el estado de la transacción con Wompi
          const response = await axios.get(
            `https://sandbox.wompi.co/v1/transactions/${transactionId}`
          );
          const transaction = response.data.data;

          if (transaction.status !== "APPROVED") {
            toast.error("El pago no fue aprobado. Intenta nuevamente.");
            navigate("/");
            return;
          }

          // Guardar la orden en Firestore
          const orderRef = doc(db, "orders", currentUser?.email!);
          const docSnap = await getDoc(orderRef);
          if (docSnap.exists()) {
            // Actualizar el documento existente
            await updateDoc(orderRef, {
              orders: arrayUnion({
                userEmail: currentUser?.email,
                paymentId: transactionId,
                orderItems: cartProduct,
                paymentMethod: "Wompi",
                userId: currentUser?.id,
                status: transaction.status,
              }),
            });
          } else {
            // Crear un nuevo documento
            await setDoc(orderRef, {
              orders: [
                {
                  userEmail: currentUser?.email,
                  paymentId: transactionId,
                  orderItems: cartProduct,
                  paymentMethod: "Wompi",
                  status: transaction.status,
                },
              ],
            });
          }

          toast.success("¡Pago aceptado y pedido guardado con éxito!");
          resetCart();
        } catch (error) {
          toast.error("Error al guardar los datos del pedido.");
        } finally {
          setLoading(false);
        }
      };

      saveOrder();
    }
  }, [transactionId, navigate, currentUser, cartProduct]);

  return (
    <Container>
      {loading && <Loading />}
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-y-5">
        <h2 className="text-2xl md:text-4xl font-bold text-center">
          {loading
            ? "Tu pago está siendo procesado"
            : "¡Tu pago fue aceptado!"}
        </h2>
        <p>
          {loading
            ? "Una vez finalizado"
            : "Ahora puedes ver tus pedidos o continuar comprando con nosotros."}
        </p>
        <div className="flex items-center gap-x-5">
          <Link to={"/pedidos"}>
            <button className="bg-black text-slate-100 w-52 h-12 rounded-full text-base font-semibold hover:bg-primeColor duration-300">
              Ver Pedidos
            </button>
          </Link>
          <Link to={"/"}>
            <button className="bg-black text-slate-100 w-52 h-12 rounded-full text-base font-semibold hover:bg-primeColor duration-300">
              Seguir Comprando
            </button>
          </Link>
        </div>
      </div>
    </Container>
  );
};

export default Success;
