// src/pages/TestShopify.tsx
import React, { useState } from 'react';
import { testShopifyConnection } from '../lib/shopify';
import { ShopifyService } from '../services/shopifyService';

const TestShopify: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<string>('No probado');
  const [shopInfo, setShopInfo] = useState<any>(null);
  const [checkoutInfo, setCheckoutInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setConnectionStatus('Probando...');
    
    const result = await testShopifyConnection();
    
    if (result.success) {
      setConnectionStatus('Conectado exitosamente');
      setShopInfo(result.shop);
    } else {
      setConnectionStatus(`Error: ${result.error}`);
      setShopInfo(null);
    }
    
    setLoading(false);
  };

  const createTestCheckout = async () => {
    setLoading(true);
    
    const checkout = await ShopifyService.createCheckout();
    
    if (checkout) {
      setCheckoutInfo(checkout);
      console.log('Checkout URL:', checkout.webUrl);
    } else {
      console.error('No se pudo crear el checkout');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Prueba de Conexión Shopify
          </h1>

          {/* Test de Conexión */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">1. Probar Conexión</h2>
            <button
              onClick={testConnection}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Probando...' : 'Probar Conexión'}
            </button>
            
            <div className="mt-4">
              <p className="font-medium">Estado: <span className="text-blue-600">{connectionStatus}</span></p>
              
              {shopInfo && (
                <div className="mt-4 p-4 bg-green-50 rounded border border-green-200">
                  <h3 className="font-semibold text-green-800">Información de la Tienda:</h3>
                  <p>Nombre: {shopInfo.name}</p>
                  <p>Dominio: {shopInfo.domain}</p>
                  <p>Moneda: {shopInfo.currencyCode}</p>
                </div>
              )}
            </div>
          </div>

          {/* Test de Checkout */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">2. Crear Checkout de Prueba</h2>
            <button
              onClick={createTestCheckout}
              disabled={loading || connectionStatus !== 'Conectado exitosamente'}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Checkout'}
            </button>
            
            {checkoutInfo && (
              <div className="mt-4 p-4 bg-green-50 rounded border border-green-200">
                <h3 className="font-semibold text-green-800">Checkout Creado:</h3>
                <p>ID: {checkoutInfo.id}</p>
                <p>Total: {checkoutInfo.totalPrice} {checkoutInfo.currencyCode}</p>
                <a 
                  href={checkoutInfo.webUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Abrir Checkout en Shopify
                </a>
              </div>
            )}
          </div>

          {/* Información importante */}
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h3 className="font-semibold text-yellow-800 mb-2">Siguiente paso:</h3>
            <p className="text-yellow-700">
              Si la conexión es exitosa, podemos proceder a integrar esto con tu carrito actual.
              El checkout que se crea aquí es donde los usuarios harán el pago.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestShopify;