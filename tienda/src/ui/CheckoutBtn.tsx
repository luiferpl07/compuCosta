import { useState } from "react";
import { useAuth } from "../context/AuthContext"; // Asegúrate que esta ruta sea correcta

// Asegúrate de instalar esta dependencia: npm install graphql-request
import { GraphQLClient } from 'graphql-request';

// Interfaces para los tipos de Shopify
interface ShopifyVariantNode {
  id: string;
  sku: string;
}

interface GetVariantsResponse {
  nodes: (ShopifyVariantNode | null)[];
}

interface CheckoutUserError {
  code: string;
  field: string[];
  message: string;
}

interface CheckoutCreateResponse {
  checkoutCreate: {
    checkout: {
      id: string;
      webUrl: string;
    };
    checkoutUserErrors: CheckoutUserError[];
  };
}

interface CheckoutBtnProps {
  products: Array<{
    idproducto: string;
    cantidad: number;
    lista1: number;
    lista2: number;
    // otras propiedades que pueda tener el producto
  }>;
}

const CheckoutBtn = ({ products }: CheckoutBtnProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Usar currentUser desde AuthContext en lugar del store
  const { currentUser, loading: authLoading } = useAuth();

  // Configuración de Shopify
  const SHOPIFY_DOMAIN = 'tu-tienda.myshopify.com'; // Reemplaza con tu dominio
  const STOREFRONT_ACCESS_TOKEN = 'tu-storefront-access-token'; // Reemplaza con tu token
  
  // Cliente GraphQL para Storefront API
  const storefrontClient = new GraphQLClient(
    `https://${SHOPIFY_DOMAIN}/api/2023-10/graphql.json`,
    {
      headers: {
        'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
        'Content-Type': 'application/json'
      }
    }
  );

  const initiateCheckout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Verificar si el usuario está autenticado usando AuthContext
      if (!currentUser && !authLoading) {
        throw new Error('Debes iniciar sesión para completar la compra');
      }

      // 1. Primero necesitamos mapear tus IDs de producto a los IDs de variante de Shopify
      const productVariantIds = await getShopifyVariantIds(
        products.map(p => p.idproducto)
      );

      if (!productVariantIds) {
        throw new Error('No se pudieron encontrar los productos en Shopify');
      }

      // 2. Crear un checkout con los productos
      const checkoutMutation = `
        mutation checkoutCreate($input: CheckoutCreateInput!) {
          checkoutCreate(input: $input) {
            checkout {
              id
              webUrl
            }
            checkoutUserErrors {
              code
              field
              message
            }
          }
        }
      `;

      // Preparar los items para el checkout
      const lineItems = products.map(product => {
        const variantId = productVariantIds[product.idproducto];
        return {
          variantId,
          quantity: product.cantidad
        };
      });

      // Realizar la mutación para crear el checkout
      const variables = {
        input: {
          lineItems,
          // Si tienes información del cliente, puedes añadirla aquí
          email: currentUser?.email,
        }
      };

      const data = await storefrontClient.request<CheckoutCreateResponse>(
        checkoutMutation, 
        variables
      );
      
      // Verificar si hay errores
      if (data.checkoutCreate.checkoutUserErrors && 
          data.checkoutCreate.checkoutUserErrors.length > 0) {
        throw new Error(data.checkoutCreate.checkoutUserErrors[0].message);
      }

      // 3. Redirigir al usuario a la URL de checkout
      window.location.href = data.checkoutCreate.checkout.webUrl;

    } catch (err: any) {
      console.error('Error iniciando checkout:', err);
      setError(err.message || 'No se pudo iniciar el proceso de pago. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para obtener los IDs de variante de Shopify basados en tus IDs de producto
  const getShopifyVariantIds = async (productIds: string[]): Promise<Record<string, string> | null> => {
    // Esta es una implementación básica. Dependiendo de cómo mapees tus productos
    // a los de Shopify, podrías necesitar una consulta diferente.
    const query = `
      query getProductVariants($ids: [ID!]!) {
        nodes(ids: $ids) {
          ... on ProductVariant {
            id
            sku
          }
        }
      }
    `;

    try {
      // Convertir tus IDs al formato que Shopify espera (Base64 encoded)
      const shopifyIds = productIds.map(id => 
        btoa(`gid://shopify/ProductVariant/${id}`)
      );

      const result = await storefrontClient.request<GetVariantsResponse>(
        query, 
        { ids: shopifyIds }
      );
      
      // Crear un mapa de tus IDs de producto a los IDs de variante de Shopify
      const idMap: Record<string, string> = {};
      
      result.nodes.forEach((node, index) => {
        if (node) {
          idMap[productIds[index]] = node.id;
        }
      });

      return idMap;
    } catch (error) {
      console.error('Error obteniendo IDs de variante de Shopify:', error);
      return null;
    }
  };

  return (
    <div className="mt-6">
      <button 
        onClick={initiateCheckout}
        disabled={isLoading || products.length === 0 || (!currentUser && !authLoading)}
        className="w-full rounded-md border border-transparent bg-red-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
      >
        {isLoading ? 'Procesando...' : 'Proceder al pago'}
      </button>
      
      {!currentUser && !authLoading && (
        <div className="text-red-500 mt-2 text-sm text-center">
          Debes iniciar sesión para completar la compra
        </div>
      )}
      
      {error && (
        <div className="text-red-500 mt-2 text-sm text-center">
          {error}
        </div>
      )}
    </div>
  );
};

export default CheckoutBtn;