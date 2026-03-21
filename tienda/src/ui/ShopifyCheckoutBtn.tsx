// src/ui/ShopifyCheckoutBtn.tsx
import React, { useState } from 'react';
import { useShopify } from '../hooks/useShopify';
import { Product } from '../../type';
import { UserType } from '../../type';
import FormatoPrecio from './FormatoPrecio';

interface ShopifyCheckoutBtnProps {
  products: Product[];
  currentUser: UserType | null;
  totalAmount: number;
  disabled?: boolean;
  className?: string;
}

const ShopifyCheckoutBtn: React.FC<ShopifyCheckoutBtnProps> = ({
  products,
  currentUser,
  totalAmount,
  disabled = false,
  className = ""
}) => {
  const { redirectToShopifyCheckout, loading: shopifyLoading } = useShopify();
  const [processingCheckout, setProcessingCheckout] = useState(false);

  const isLoading = shopifyLoading || processingCheckout;
  const isDisabled = disabled || isLoading || products.length === 0;

  const handleCheckout = async () => {
    try {
      setProcessingCheckout(true);
      
      // Validación básica
      if (!products || products.length === 0) {
        alert('No hay productos en el carrito');
        return;
      }

      console.log('Iniciando checkout con productos:', products);
      
      // Preparar productos con las cantidades correctas del carrito
      const productsWithQuantity = products.map(product => ({
        ...product,
        cantidad: product.cantidad || 1 // Asegurar que tenga cantidad
      }));

      // Redirigir a Shopify Checkout
      await redirectToShopifyCheckout(productsWithQuantity);
      
    } catch (error) {
      console.error('Error en checkout:', error);
      
      // Mostrar error user-friendly
      const errorMessage = error instanceof Error ? error.message : 'Error procesando el pago';
      alert(`Hubo un problema: ${errorMessage}. Por favor intenta de nuevo.`);
    } finally {
      setProcessingCheckout(false);
    }
  };

  // Si no hay productos, mostrar botón deshabilitado
  if (products.length === 0) {
    return (
      <button 
        disabled 
        className={`w-full mt-6 rounded-md border border-gray-300 bg-gray-100 px-6 py-3 text-base font-medium text-gray-400 cursor-not-allowed ${className}`}
      >
        Carrito vacío
      </button>
    );
  }

  return (
    <div className="mt-6">
      {/* Mostrar total calculado */}
      <div className="flex justify-between items-center mb-4 p-4 bg-gray-50 rounded-lg">
        <span className="text-lg font-semibold text-gray-900">Total a pagar:</span>
        <span className="text-xl font-bold text-green-600">
          <FormatoPrecio amount={totalAmount} />
        </span>
      </div>

      {/* Botón principal */}
      <button
        onClick={handleCheckout}
        disabled={isDisabled}
        className={`
          w-full rounded-md border border-transparent px-6 py-3 text-base font-medium text-white
          transition-all duration-200 transform
          ${isDisabled 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-red-600 hover:bg-red-700 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl'
          }
          ${className}
        `}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            {processingCheckout ? 'Preparando pago...' : 'Cargando...'}
          </div>
        ) : (
          'Proceder al pago seguro'
        )}
      </button>

      {/* Información adicional */}
      <div className="mt-3 text-center">
        <p className="text-sm text-gray-600">
          🔒 Pago 100% seguro con Shopify
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Serás redirigido a nuestro procesador de pagos seguro
        </p>
      </div>

      {/* Info del usuario si está logueado */}
      {currentUser && (
        <div className="mt-3 text-center">
          <p className="text-sm text-gray-600">
            Comprando como: <span className="font-medium">{currentUser.firstName} {currentUser.lastName}</span>
          </p>
        </div>
      )}

      {/* Información de productos */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500">
          {products.length} producto{products.length !== 1 ? 's' : ''} en el carrito
        </p>
      </div>
    </div>
  );
};

export default ShopifyCheckoutBtn;