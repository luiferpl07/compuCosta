// src/lib/shopify.ts
import Client from 'shopify-buy';

// Validar que las variables de entorno estén disponibles
const shopifyDomain = import.meta.env.VITE_SHOPIFY_DOMAIN;
const storefrontToken = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN;

if (!shopifyDomain || !storefrontToken) {
  console.error('❌ Variables de entorno de Shopify faltantes');
  console.error('VITE_SHOPIFY_DOMAIN:', shopifyDomain ? '✅ Configurado' : '❌ Faltante');
  console.error('VITE_SHOPIFY_STOREFRONT_TOKEN:', storefrontToken ? '✅ Configurado' : '❌ Faltante');
}

// Crear cliente Shopify
const shopifyClient = Client.buildClient({
  domain: shopifyDomain,
  storefrontAccessToken: storefrontToken,
});

// Función para probar la conexión
export const testShopifyConnection = async () => {
  try {
    console.log('🔄 Probando conexión con Shopify...');
    
    // Intentar obtener la tienda
    const shop = await shopifyClient.shop.fetchInfo();
    
    console.log('✅ Conexión exitosa con Shopify');
    console.log('📊 Info de la tienda:', {
      name: shop.name,
      domain: shop.domain,
      currencyCode: shop.currencyCode,
    });
    
    return { success: true, shop };
  } catch (error) {
    console.error('❌ Error conectando con Shopify:', error);
    return { success: false, error };
  }
};

export default shopifyClient;