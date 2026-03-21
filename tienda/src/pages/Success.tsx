// src/pages/Success.tsx - Página de éxito después de Shopify checkout
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useShopify } from '../hooks/useShopify';
import { store } from '../lib/store';
import Container from '../ui/Container';
import FormatoPrecio from '../ui/FormatoPrecio';

interface OrderInfo {
  orderId?: string;
  total?: string;
  currency?: string;
  status?: string;
}

const Success: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { completeCheckout, clearCheckout } = useShopify();
  const { clearCart } = store();
  const [orderInfo, setOrderInfo] = useState<OrderInfo>({});
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processSuccessfulPayment = async () => {
      try {
        console.log('Procesando pago exitoso...');
        
        // Obtener parámetros de URL que Shopify puede enviar
        const orderId = searchParams.get('order_id') || searchParams.get('checkout_id');
        const total = searchParams.get('total_price');
        const currency = searchParams.get('currency') || 'COP';
        
        // Guardar información de la orden
        setOrderInfo({
          orderId: orderId || undefined,
          total: total || undefined,
          currency: currency,
          status: 'completed'
        });

        // Limpiar el carrito local
        clearCart();
        
        // Limpiar el checkout de Shopify
        completeCheckout();
        
        console.log('Carrito limpiado después del pago exitoso');
        
      } catch (error) {
        console.error('Error procesando pago exitoso:', error);
      } finally {
        setIsProcessing(false);
      }
    };

    processSuccessfulPayment();
  }, [searchParams, clearCart, completeCheckout]);

  if (isProcessing) {
    return (
      <Container>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900">Procesando tu pedido...</h2>
            <p className="text-gray-600 mt-2">Por favor espera un momento</p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="min-h-screen flex items-center justify-center py-12">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Ícono de éxito */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Título principal */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Pago Exitoso!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Tu pedido ha sido procesado correctamente y recibirás un email de confirmación pronto.
          </p>

          {/* Información del pedido si está disponible */}
          {orderInfo.orderId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-2">Detalles del pedido:</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  <span className="font-medium">ID del pedido:</span> {orderInfo.orderId}
                </p>
                {orderInfo.total && (
                  <p>
                    <span className="font-medium">Total pagado:</span>{' '}
                    <FormatoPrecio amount={parseFloat(orderInfo.total)} />
                  </p>
                )}
                <p>
                  <span className="font-medium">Estado:</span>{' '}
                  <span className="text-green-600 font-medium">Confirmado</span>
                </p>
              </div>
            </div>
          )}

          {/* Información adicional */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">¿Qué sigue?</h3>
            <ul className="text-sm text-blue-800 text-left space-y-1">
              <li>• Recibirás un email de confirmación</li>
              <li>• Te notificaremos cuando tu pedido sea enviado</li>
              <li>• Puedes revisar el estado en tu perfil</li>
            </ul>
          </div>

          {/* Botones de acción */}
          <div className="space-y-3">
            <Link
              to="/productos"
              className="w-full bg-red-600 text-white py-3 px-4 rounded-md font-medium hover:bg-red-700 transition-colors duration-200 block text-center"
            >
              Seguir Comprando
            </Link>
            
            <Link
              to="/pedidos"
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-md font-medium hover:bg-gray-200 transition-colors duration-200 block text-center"
            >
              Ver Mis Pedidos
            </Link>
            
            <Link
              to="/"
              className="w-full text-gray-500 py-2 px-4 rounded-md font-medium hover:text-gray-700 transition-colors duration-200 block text-center"
            >
              Ir al Inicio
            </Link>
          </div>

          {/* Información de soporte */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              ¿Tienes preguntas sobre tu pedido?{' '}
              <Link to="/contacto" className="text-red-600 hover:text-red-700">
                Contáctanos
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Success;