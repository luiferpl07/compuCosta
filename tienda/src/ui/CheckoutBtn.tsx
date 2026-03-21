import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GraphQLClient } from 'graphql-request';

interface CheckoutUserError {
  code: string;
  field: string[];
  message: string;
}

interface CartCreateResponse {
  cartCreate: {
    cart: {
      id: string;
      checkoutUrl: string;
    };
    userErrors: CheckoutUserError[];
  };
}

interface ProductWithShopify {
  idproducto: string;
  cantidad: number;
  lista1: number;
  lista2: number;
  shopify_product_id?: string;
  shopifyProductId?: string;
  shopify_variant_id?: string;
  shopifyVariantId?: string;
  nombre?: string;
  nombreproducto?: string;
}

interface CheckoutBtnProps {
  products: ProductWithShopify[];
  currentUser?: any;
  embedded?: boolean;
}

const CheckoutBtn = ({ products, currentUser, embedded = false }: CheckoutBtnProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { currentUser: authCurrentUser, loading: authLoading } = useAuth();
  const user = currentUser || authCurrentUser;

  const SHOPIFY_DOMAIN = import.meta.env.VITE_SHOPIFY_DOMAIN;
  const STOREFRONT_ACCESS_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN;
  
  if (!SHOPIFY_DOMAIN || !STOREFRONT_ACCESS_TOKEN) {
    console.error('❌ Configuración de Shopify faltante:', {
      domain: SHOPIFY_DOMAIN ? '✓' : '✗',
      token: STOREFRONT_ACCESS_TOKEN ? '✓' : '✗'
    });
  }
  
  const storefrontClient = new GraphQLClient(
    `https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`,
    {
      headers: {
        'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
        'Content-Type': 'application/json'
      }
    }
  );

  const handleCheckout = async () => {
    await initiateCheckout();
  };

  const initiateCheckout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('=== VERIFICACIÓN DE CONFIGURACIÓN ===');
      console.log('SHOPIFY_DOMAIN:', SHOPIFY_DOMAIN);
      console.log('STOREFRONT_ACCESS_TOKEN:', STOREFRONT_ACCESS_TOKEN ? `${STOREFRONT_ACCESS_TOKEN.substring(0, 10)}...` : 'NO DEFINIDO');
      
      if (!SHOPIFY_DOMAIN || SHOPIFY_DOMAIN === 'undefined') {
        throw new Error('VITE_SHOPIFY_DOMAIN no está configurado en las variables de entorno');
      }
      
      if (!STOREFRONT_ACCESS_TOKEN || STOREFRONT_ACCESS_TOKEN === 'undefined') {
        throw new Error('VITE_SHOPIFY_STOREFRONT_TOKEN no está configurado en las variables de entorno');
      }

      console.log('\n=== DEBUG CHECKOUT ===');
      console.log('Productos recibidos:', products);
      console.log('Total productos:', products.length);
      
      products.forEach((p, index) => {
        console.log(`\n🔍 Producto ${index + 1} - DETALLE COMPLETO:`);
        console.log('  📦 Objeto completo:', p);
        console.log('  🆔 idproducto:', p.idproducto);
        console.log('  📝 nombre:', p.nombre || p.nombreproducto);
        console.log('  🏪 shopify_product_id:', p.shopify_product_id);
        console.log('  🏪 shopifyProductId:', p.shopifyProductId);
        console.log('  🔖 shopify_variant_id:', p.shopify_variant_id);
        console.log('  🔖 shopifyVariantId:', p.shopifyVariantId);
        console.log('  📊 cantidad:', p.cantidad);
        console.log('  ⚠️  shopify_product_id es undefined?', p.shopify_product_id === undefined);
        console.log('  ⚠️  shopify_product_id es null?', p.shopify_product_id === null);
        console.log('  ⚠️  shopify_product_id es string vacío?', p.shopify_product_id === '');
        console.log('  ⚠️  Tipo de shopify_product_id:', typeof p.shopify_product_id);
        console.log('  📋 Todas las propiedades del objeto:', Object.keys(p));
      });

      // ✅ Normalizar productos
      const normalizedProducts = products.map(p => ({
        ...p,
        shopifyProductId: p.shopifyProductId || p.shopify_product_id,
        shopifyVariantId: p.shopifyVariantId || p.shopify_variant_id
      }));

      console.log('\n🔄 Productos después de normalizar:');
      normalizedProducts.forEach((p, index) => {
        console.log(`  Producto ${index + 1}:`, {
          idproducto: p.idproducto,
          shopifyProductId: p.shopifyProductId,
          shopifyVariantId: p.shopifyVariantId
        });
      });

      console.log('\n🔍 Obteniendo Variant IDs con TRIPLE FALLBACK...');
      
      // ✅ Crear array para guardar los resultados de búsqueda
      const variantResults: Array<{
        productInfo: any;
        variantId: string | null;
        metodo: string;
      }> = [];

      // ✅ PROCESAR CADA PRODUCTO CON TRIPLE FALLBACK
      for (const product of normalizedProducts) {
        let variantId: string | null = null;
        let metodo = '';

        // 🎯 MÉTODO 1: Buscar por shopify_product_id
        if (product.shopifyProductId) {
          console.log(`\n🔍 Método 1: Buscando producto ${product.idproducto} por Product ID: ${product.shopifyProductId}`);
          
          const productIdGid = product.shopifyProductId.startsWith('gid://') 
            ? product.shopifyProductId 
            : `gid://shopify/Product/${product.shopifyProductId}`;

          const queryByProductId = `
            query getProduct($id: ID!) {
              node(id: $id) {
                ... on Product {
                  id
                  title
                  availableForSale
                  variants(first: 1) {
                    edges {
                      node {
                        id
                        availableForSale
                      }
                    }
                  }
                }
              }
            }
          `;

          try {
            const result = await storefrontClient.request<any>(queryByProductId, { id: productIdGid });
            
            if (result.node && result.node.availableForSale) {
              const variant = result.node.variants.edges[0]?.node;
              if (variant && variant.availableForSale) {
                variantId = variant.id;
                metodo = '✅ Product ID';
                console.log(`✅ Encontrado por Product ID: ${variantId}`);
              }
            }
          } catch (err) {
            console.log(`⚠️ No encontrado por Product ID, probando siguiente método...`);
          }
        } else {
          console.log(`\n⚠️ MÉTODO 1 OMITIDO: producto ${product.idproducto} NO tiene shopifyProductId`);
        }

        // 🎯 MÉTODO 2: Buscar por shopify_variant_id (si el método 1 falló)
        if (!variantId && product.shopifyVariantId) {
          console.log(`\n🔍 Método 2: Buscando producto ${product.idproducto} por Variant ID: ${product.shopifyVariantId}`);
          
          const variantIdGid = product.shopifyVariantId.startsWith('gid://') 
            ? product.shopifyVariantId 
            : `gid://shopify/ProductVariant/${product.shopifyVariantId}`;

          const queryByVariantId = `
            query getVariant($id: ID!) {
              node(id: $id) {
                ... on ProductVariant {
                  id
                  availableForSale
                  product {
                    availableForSale
                  }
                }
              }
            }
          `;

          try {
            const result = await storefrontClient.request<any>(queryByVariantId, { id: variantIdGid });
            
            if (result.node && result.node.availableForSale && result.node.product.availableForSale) {
              variantId = result.node.id;
              metodo = '✅ Variant ID';
              console.log(`✅ Encontrado por Variant ID: ${variantId}`);
            }
          } catch (err) {
            console.log(`⚠️ No encontrado por Variant ID, probando siguiente método...`);
          }
        } else if (!variantId) {
          console.log(`\n⚠️ MÉTODO 2 OMITIDO: producto ${product.idproducto} NO tiene shopifyVariantId`);
        }

        // 🎯 MÉTODO 3: Buscar por SKU (idproducto) (si los métodos 1 y 2 fallaron)
        if (!variantId) {
          console.log(`\n🔍 Método 3: Buscando producto ${product.idproducto} por SKU (idproducto)`);
          
          const queryBySKU = `
            query searchBySKU($query: String!) {
              products(first: 1, query: $query) {
                edges {
                  node {
                    id
                    title
                    availableForSale
                    variants(first: 5) {
                      edges {
                        node {
                          id
                          sku
                          availableForSale
                        }
                      }
                    }
                  }
                }
              }
            }
          `;

          try {
            const result = await storefrontClient.request<any>(queryBySKU, { 
              query: `sku:${product.idproducto}` 
            });
            
            console.log(`  📊 Resultado búsqueda por SKU:`, result);
            
            if (result.products.edges.length > 0) {
              const foundProduct = result.products.edges[0].node;
              
              console.log(`  ✅ Producto encontrado:`, foundProduct.title);
              console.log(`  📦 Disponible para venta:`, foundProduct.availableForSale);
              console.log(`  🔖 Variantes encontradas:`, foundProduct.variants.edges.length);
              
              if (foundProduct.availableForSale) {
                // Buscar la variante que coincida con el SKU
                const matchingVariant = foundProduct.variants.edges.find(
                  (edge: any) => edge.node.sku === product.idproducto && edge.node.availableForSale
                );
                
                if (matchingVariant) {
                  variantId = matchingVariant.node.id;
                  metodo = '✅ SKU (idproducto)';
                  console.log(`✅ Encontrado por SKU exacto: ${variantId}`);
                } else {
                  // Si no hay coincidencia exacta, usar la primera variante disponible
                  const firstAvailable = foundProduct.variants.edges.find(
                    (edge: any) => edge.node.availableForSale
                  );
                  if (firstAvailable) {
                    variantId = firstAvailable.node.id;
                    metodo = '⚠️ SKU (primera variante)';
                    console.log(`⚠️ Usando primera variante disponible: ${variantId}`);
                  }
                }
              } else {
                console.log(`  ❌ Producto no disponible para venta`);
              }
            } else {
              console.log(`  ❌ No se encontraron productos con SKU: ${product.idproducto}`);
            }
          } catch (err) {
            console.log(`❌ Error en búsqueda por SKU:`, err);
          }
        }

        // Guardar resultado
        variantResults.push({
          productInfo: product,
          variantId,
          metodo
        });

        console.log(`\n📝 Resultado final para producto ${product.idproducto}:`, {
          variantId,
          metodo: metodo || '❌ No encontrado'
        });
      }

      // ✅ Verificar que todos los productos fueron encontrados
      const notFound = variantResults.filter(r => !r.variantId);
      
      if (notFound.length > 0) {
        console.error('\n❌ Productos no encontrados:', notFound);
        
        const errorDetails = notFound.map(item => 
          `${item.productInfo.nombre || item.productInfo.nombreproducto} (ID: ${item.productInfo.idproducto})`
        ).join(', ');
        
        throw new Error(
          `${notFound.length} producto(s) no encontrados en Shopify: ${errorDetails}. ` +
          `Verifica que estén sincronizados y publicados en "Online Store".`
        );
      }

      // ✅ Mostrar resumen de métodos usados
      console.log('\n📊 Resumen de búsqueda:');
      variantResults.forEach(r => {
        console.log(`  ${r.productInfo.idproducto}: ${r.metodo}`);
      });

      // ✅ Crear line items con los Variant IDs encontrados
      const lineItems = variantResults.map(result => ({
        merchandiseId: result.variantId!,
        quantity: result.productInfo.cantidad
      }));

      // ✅ Crear carrito
      const cartMutation = `
        mutation cartCreate($input: CartInput!) {
          cartCreate(input: $input) {
            cart {
              id
              checkoutUrl
            }
            userErrors {
              code
              field
              message
            }
          }
        }
      `;

      const variables = {
        input: {
          lines: lineItems,
          buyerIdentity: {
            email: user?.email || undefined,
          }
        }
      };

      console.log('🛒 Creando carrito con', lineItems.length, 'productos...');

      const data = await storefrontClient.request<CartCreateResponse>(
        cartMutation, 
        variables
      );
      
      if (data.cartCreate.userErrors?.length > 0) {
        const errorMessages = data.cartCreate.userErrors
          .map(err => err.message)
          .join(', ');
        throw new Error(errorMessages);
      }

      console.log('✅ Carrito creado exitosamente');
      console.log('Redirigiendo a:', data.cartCreate.cart.checkoutUrl);
      
      if (embedded) {
        setCheckoutUrl(data.cartCreate.cart.checkoutUrl);
        setShowModal(true);
      } else {
        window.location.href = data.cartCreate.cart.checkoutUrl;
      }

    } catch (err: any) {
      console.error('❌ Error iniciando checkout:', err);
      console.error('Detalles completos del error:', {
        message: err.message,
        response: err.response,
        request: err.request,
        stack: err.stack
      });
      
      let errorMessage = 'No se pudo iniciar el proceso de pago.';
      
      if (err.message?.includes('Failed to fetch')) {
        errorMessage = 'Error de conexión con Shopify. Verifica tu configuración de API.';
      } else if (err.message?.includes('not found') || err.message?.includes('no encontrados')) {
        errorMessage = err.message;
      } else if (err.message?.includes('insufficient')) {
        errorMessage = 'No hay suficiente inventario para completar tu pedido.';
      } else if (err.response?.errors) {
        errorMessage = err.response.errors.map((e: any) => e.message).join(', ');
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="mt-6">
        <button 
          onClick={handleCheckout}
          disabled={isLoading || products.length === 0}
          className="w-full rounded-md border border-transparent bg-red-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Procesando...
            </span>
          ) : (
            'Pagar pedido'
          )}
        </button>
        
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm text-center">
              {error}
            </p>
          </div>
        )}
      </div>

      {showModal && checkoutUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">Finalizar compra</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setCheckoutUrl(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                src={checkoutUrl}
                className="w-full h-full border-0"
                title="Checkout de Shopify"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CheckoutBtn;