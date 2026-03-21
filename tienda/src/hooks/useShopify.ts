// src/hooks/useShopify.ts
import { useShopifyContext } from '../context/ShopifyContext';
import { Product } from '../../type';

export const useShopify = () => {
  const {
    checkout,
    loading,
    error,
    createCheckout,
    createCheckoutWithProducts,
    clearCheckout,
    refreshCheckout
  } = useShopifyContext();

  // Función para proceder al checkout con productos del carrito
  const proceedToShopifyCheckout = async (cartProducts: Product[]): Promise<string | null> => {
    try {
      console.log('Iniciando proceso de checkout con Shopify...');
      
      if (!cartProducts || cartProducts.length === 0) {
        throw new Error('No hay productos en el carrito');
      }

      // Crear checkout con los productos del carrito
      const newCheckout = await createCheckoutWithProducts(cartProducts);
      
      if (newCheckout && newCheckout.webUrl) {
        console.log('Checkout creado, redirigiendo a:', newCheckout.webUrl);
        return newCheckout.webUrl;
      } else {
        throw new Error('No se pudo obtener la URL del checkout');
      }
      
    } catch (err) {
      console.error('Error en proceedToShopifyCheckout:', err);
      throw err;
    }
  };

  // Función para redirigir directamente a Shopify
  const redirectToShopifyCheckout = async (cartProducts: Product[]): Promise<void> => {
    try {
      const checkoutUrl = await proceedToShopifyCheckout(cartProducts);
      
      if (checkoutUrl) {
        // Redirigir en la misma ventana
        window.location.href = checkoutUrl;
      } else {
        throw new Error('No se pudo obtener la URL del checkout');
      }
    } catch (err) {
      console.error('Error redirigiendo a Shopify:', err);
      throw err;
    }
  };

  // Función para abrir checkout en nueva ventana (opcional)
  const openShopifyCheckoutInNewTab = async (cartProducts: Product[]): Promise<void> => {
    try {
      const checkoutUrl = await proceedToShopifyCheckout(cartProducts);
      
      if (checkoutUrl) {
        window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
      } else {
        throw new Error('No se pudo obtener la URL del checkout');
      }
    } catch (err) {
      console.error('Error abriendo checkout en nueva pestaña:', err);
      throw err;
    }
  };

  // Función para limpiar el checkout después de completar la compra
  const completeCheckout = () => {
    clearCheckout();
    console.log('Checkout completado y limpiado');
  };

  // Función para verificar si hay un checkout activo
  const hasActiveCheckout = (): boolean => {
    return checkout !== null;
  };

  // Función para obtener información del checkout actual
  const getCheckoutInfo = () => {
    if (!checkout) return null;
    
    return {
      id: checkout.id,
      totalPrice: checkout.totalPrice,
      currencyCode: checkout.currencyCode,
      itemCount: checkout.lineItems.length,
      webUrl: checkout.webUrl
    };
  };

  // Función para calcular el total en tu moneda local
  const calculateLocalTotal = (cartProducts: Product[]): number => {
    return cartProducts.reduce((total, product) => {
      // Usar tu lógica actual de precios
      const isLista2Active = product.lista2_activa === true;
      const hasLista2Price = product.lista2 && product.lista2 > 0;
      const finalPrice = (isLista2Active && hasLista2Price) ? product.lista1 : product.lista1;
      
      return total + (finalPrice * (product.cantidad || 1));
    }, 0);
  };

  return {
    // Estado
    checkout,
    loading,
    error,
    hasActiveCheckout: hasActiveCheckout(),
    checkoutInfo: getCheckoutInfo(),
    
    // Funciones principales
    proceedToShopifyCheckout,
    redirectToShopifyCheckout,
    openShopifyCheckoutInNewTab,
    completeCheckout,
    
    // Funciones de utilidad
    calculateLocalTotal,
    refreshCheckout,
    clearCheckout: completeCheckout, // Alias más semántico
    
    // Funciones del contexto (por si las necesitas directamente)
    createCheckout,
    createCheckoutWithProducts
  };
};