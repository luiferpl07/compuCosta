// src/context/ShopifyContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ShopifyService } from '../services/shopifyService';
import { Product } from '../../type';

interface ShopifyCheckout {
  id: string;
  webUrl: string;
  totalPrice: string;
  currencyCode: string;
  lineItems: any[];
}

interface ShopifyContextType {
  checkout: ShopifyCheckout | null;
  loading: boolean;
  error: string | null;
  createCheckout: () => Promise<ShopifyCheckout | null>;
  createCheckoutWithProducts: (products: Product[]) => Promise<ShopifyCheckout | null>;
  clearCheckout: () => void;
  refreshCheckout: () => Promise<void>;
}

const ShopifyContext = createContext<ShopifyContextType | null>(null);

export const useShopifyContext = () => {
  const context = useContext(ShopifyContext);
  if (!context) {
    throw new Error('useShopifyContext debe ser usado dentro de ShopifyProvider');
  }
  return context;
};

interface ShopifyProviderProps {
  children: ReactNode;
}

export const ShopifyProvider: React.FC<ShopifyProviderProps> = ({ children }) => {
  const [checkout, setCheckout] = useState<ShopifyCheckout | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar checkout existente al inicializar
  useEffect(() => {
    const loadExistingCheckout = async () => {
      const checkoutId = ShopifyService.getCheckoutFromStorage();
      if (checkoutId) {
        console.log('Cargando checkout existente:', checkoutId);
        const existingCheckout = await ShopifyService.getCheckout(checkoutId);
        if (existingCheckout) {
          setCheckout(existingCheckout);
        } else {
          // Si el checkout no existe o expiró, limpiar storage
          ShopifyService.clearCheckoutFromStorage();
        }
      }
    };

    loadExistingCheckout();
  }, []);

  const createCheckout = async (): Promise<ShopifyCheckout | null> => {
    setLoading(true);
    setError(null);

    try {
      const newCheckout = await ShopifyService.createCheckout();
      
      if (newCheckout) {
        setCheckout(newCheckout);
        ShopifyService.saveCheckoutToStorage(newCheckout.id);
        console.log('Checkout creado y guardado:', newCheckout.id);
        return newCheckout;
      } else {
        setError('No se pudo crear el checkout');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error creando checkout:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createCheckoutWithProducts = async (products: Product[]): Promise<ShopifyCheckout | null> => {
    setLoading(true);
    setError(null);

    try {
      console.log('Creando checkout con productos:', products.length);
      
      const newCheckout = await ShopifyService.createCheckoutWithProducts(products);
      
      if (newCheckout) {
        setCheckout(newCheckout);
        ShopifyService.saveCheckoutToStorage(newCheckout.id);
        console.log('Checkout con productos creado:', newCheckout.id);
        return newCheckout;
      } else {
        setError('No se pudo crear el checkout con productos');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error creando checkout con productos:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearCheckout = () => {
    setCheckout(null);
    setError(null);
    ShopifyService.clearCheckoutFromStorage();
    console.log('Checkout limpiado');
  };

  const refreshCheckout = async () => {
    if (!checkout) return;

    setLoading(true);
    try {
      const updatedCheckout = await ShopifyService.getCheckout(checkout.id);
      if (updatedCheckout) {
        setCheckout(updatedCheckout);
      } else {
        clearCheckout();
      }
    } catch (err) {
      console.error('Error refrescando checkout:', err);
      setError('Error refrescando checkout');
    } finally {
      setLoading(false);
    }
  };

  const value: ShopifyContextType = {
    checkout,
    loading,
    error,
    createCheckout,
    createCheckoutWithProducts,
    clearCheckout,
    refreshCheckout
  };

  return (
    <ShopifyContext.Provider value={value}>
      {children}
    </ShopifyContext.Provider>
  );
};