// src/services/shopifyService.ts
import shopifyClient from '../lib/shopify';
import { Product } from '../../type';

interface ShopifyLineItem {
  variantId: string;
  quantity: number;
  customAttributes?: Array<{ key: string; value: string }>;
}

interface ShopifyCheckout {
  id: string;
  webUrl: string;
  totalPrice: string;
  currencyCode: string;
  lineItems: any[];
}

export class ShopifyService {
  
  // Crear un nuevo checkout
  static async createCheckout(): Promise<ShopifyCheckout | null> {
    try {
      console.log('🛒 Creando checkout en Shopify...');
      
      const checkout = await shopifyClient.checkout.create();
      
      console.log('✅ Checkout creado:', checkout.id);
      return {
        id: checkout.id,
        webUrl: checkout.webUrl,
        totalPrice: checkout.totalPrice,
        currencyCode: checkout.currencyCode,
        lineItems: checkout.lineItems || []
      };
      
    } catch (error) {
      console.error('❌ Error creando checkout:', error);
      return null;
    }
  }

  // Obtener checkout existente
  static async getCheckout(checkoutId: string): Promise<ShopifyCheckout | null> {
    try {
      const checkout = await shopifyClient.checkout.fetch(checkoutId);
      
      return {
        id: checkout.id,
        webUrl: checkout.webUrl,
        totalPrice: checkout.totalPrice,
        currencyCode: checkout.currencyCode,
        lineItems: checkout.lineItems || []
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo checkout:', error);
      return null;
    }
  }

  // Convertir producto de tu sistema a formato Shopify
  static convertProductToShopifyLineItem(product: Product): ShopifyLineItem {
    // Por ahora usamos un variant genérico
    // Más adelante sincronizaremos productos reales
    const genericVariantId = 'gid://shopify/ProductVariant/GENERIC_VARIANT_ID';
    
    // Calcular precio según tu lógica actual
    const isLista2Active = product.lista2_activa === true;
    const hasLista2Price = product.lista2 && product.lista2 > 0;
    const finalPrice = (isLista2Active && hasLista2Price) ? product.lista1 : product.lista1;
    
    return {
      variantId: genericVariantId,
      quantity: product.cantidad || 1,
      customAttributes: [
        { key: 'originalId', value: product.idproducto },
        { key: 'originalName', value: product.nombreproducto },
        { key: 'lista1', value: product.lista1.toString() },
        { key: 'lista2', value: product.lista2?.toString() || '' },
        { key: 'lista2_activa', value: product.lista2_activa?.toString() || 'false' },
        { key: 'finalPrice', value: finalPrice.toString() },
        { key: 'marca', value: Array.isArray(product.marca) && product.marca.length > 0 ? product.marca[0].marca.nombre : 'Sin marca' }
      ]
    };
  }

  // Agregar productos al checkout
  static async addProductsToCheckout(checkoutId: string, products: Product[]): Promise<ShopifyCheckout | null> {
    try {
      console.log(`🛒 Agregando ${products.length} productos al checkout...`);
      
      const lineItems = products.map(product => 
        this.convertProductToShopifyLineItem(product)
      );
      
      const updatedCheckout = await shopifyClient.checkout.addLineItems(checkoutId, lineItems);
      
      console.log('✅ Productos agregados al checkout');
      
      return {
        id: updatedCheckout.id,
        webUrl: updatedCheckout.webUrl,
        totalPrice: updatedCheckout.totalPrice,
        currencyCode: updatedCheckout.currencyCode,
        lineItems: updatedCheckout.lineItems || []
      };
      
    } catch (error) {
      console.error('❌ Error agregando productos:', error);
      return null;
    }
  }

  // Función completa para crear checkout con productos
  static async createCheckoutWithProducts(products: Product[]): Promise<ShopifyCheckout | null> {
    try {
      // 1. Crear checkout vacío
      const checkout = await this.createCheckout();
      if (!checkout) return null;
      
      // 2. Agregar productos
      const checkoutWithProducts = await this.addProductsToCheckout(checkout.id, products);
      
      return checkoutWithProducts;
      
    } catch (error) {
      console.error('❌ Error en createCheckoutWithProducts:', error);
      return null;
    }
  }

  // Limpiar checkout (para después del pago)
  static clearCheckoutFromStorage() {
    localStorage.removeItem('shopify_checkout_id');
    console.log('🧹 Checkout limpiado del localStorage');
  }

  // Guardar checkout ID en localStorage
  static saveCheckoutToStorage(checkoutId: string) {
    localStorage.setItem('shopify_checkout_id', checkoutId);
    console.log('💾 Checkout ID guardado en localStorage');
  }

  // Obtener checkout ID del localStorage
  static getCheckoutFromStorage(): string | null {
    return localStorage.getItem('shopify_checkout_id');
  }
}