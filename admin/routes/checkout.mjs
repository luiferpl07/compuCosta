import { Router } from "express";
import axios from "axios";

const router = Router();

// Llave privada de Wompi desde las variables de entorno
const wompiPrivateKey = process.env.WOMPI_LLAVE_PRIVADA;

// Endpoint para procesar pagos
router.post("/checkout", async (req, res) => {
  try {
    const { items, email } = req.body;

    // Calcular el monto total de los productos
    const totalAmountInCents = items.reduce(
      (total, item) => total + item.quantity * item.discountedPrice * 100,
      0
    );

    // Crear el payload para Wompi
    const paymentData = {
      amount_in_cents: totalAmountInCents,
      currency: "COP",
      customer_email: email,
      payment_method: {
        type: "CARD",
        token: req.body.paymentToken, // Token generado en el frontend
      },
      reference: `order-${Date.now()}`, // Identificador único para el pedido
      redirect_url: "http://localhost:5173/success", // URL de éxito
    };

    // Enviar solicitud a la API de Wompi
    const response = await axios.post(
      "https://production.wompi.co/v1/transactions",
      paymentData,
      {
        headers: {
          Authorization: `Bearer ${wompiPrivateKey}`,
        },
      }
    );

    // Responder con los datos de la transacción
    res.json({
      message: "Transacción procesada con éxito",
      success: true,
      transaction: response.data.data,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error procesando el pago",
      success: false,
      error: error.response?.data || error.message,
    });
  }
});

export default router;
