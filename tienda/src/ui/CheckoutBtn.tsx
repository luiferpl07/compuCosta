import { ProductProps } from "../../type";
import { store } from "../lib/store";
import { config } from "../../config";

const CheckoutBtn = ({ products }: { products: ProductProps[] }) => {
  const { currentUser } = store();
  const publicKey = "tu_llave_publica_wompi";

  const handleCheckout = async () => {
    try {
      // Calcular el monto total
      const totalAmountInCents = products.reduce(
        (total, product) => total + product.quantity * product.discountedPrice * 100,
        0
      );

      // Crear sesión de pago en el backend
      const response = await fetch(`${config?.baseUrl}/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: products,
          email: currentUser?.email,
        }),
      });

      const { transactionId } = await response.json();

      if (!transactionId) {
        throw new Error("No se pudo crear la transacción.");
      }

      // Usar el widget de Wompi
      const script = document.createElement("script");
      script.src = "https://checkout.wompi.co/widget.js";
      document.body.appendChild(script);

      script.onload = () => {
        const checkout = new WidgetCheckout({
          currency: "COP",
          amountInCents: totalAmountInCents,
          reference: `order-${transactionId}`, // Referencia única
          publicKey: publicKey,
          redirectUrl: "http://localhost:5173/success", // Redirección en caso de éxito
        });

        checkout.open((result) => {
          if (result.status === "APPROVED") {
            window.alert("Pago aprobado");
          } else {
            window.alert("Pago rechazado o en proceso.");
          }
        });
      };
    } catch (error) {
      console.error("Error procesando el pago:", error);
      window.alert("Hubo un error al procesar el pago. Por favor, inténtalo de nuevo.");
    }
  };

  return (
    <div className="mt-6">
      {currentUser ? (
        <button
          onClick={handleCheckout}
          type="submit"
          className="w-full rounded-md border border-transparent bg-gray-800 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-black focus:outline-none focus:ring-2 focus:ring-skyText focus:ring-offset-2 focus:ring-offset-gray-50 duration-200"
        >
          Checkout
        </button>
      ) : (
        <button className="w-full text-base text-white text-center rounded-md border border-transparent bg-gray-500 px-4 py-3 cursor-not-allowed">
          Checkout
        </button>
      )}
      {!currentUser && (
        <p className="mt-2 text-sm font-medium text-red-500 text-center">
          Need to sign in to make checkout
        </p>
      )}
    </div>
  );
};

export default CheckoutBtn;
