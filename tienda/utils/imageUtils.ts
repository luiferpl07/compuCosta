import { config } from "../config";
import { Product } from "../type"; 

export const getProductImage = (imagenes: Product["imagenes"] | undefined) => {
  if (!imagenes?.length) return 'ruta-a-imagen-por-defecto';

  const principal = imagenes.find(img => img.es_principal)?.url;
  if (principal) return principal.startsWith("http") ? principal : `${config?.baseUrl}${principal}`;

  const primeraImagen = imagenes[0]?.url;
  return primeraImagen.startsWith("http") ? primeraImagen : `${config?.baseUrl}${primeraImagen}`;
};

export const getProductImageAlt = (imagenes: Product["imagenes"] | undefined, nombreproducto: string) => {
  return imagenes?.find(img => img.es_principal)?.alt_text ||
         imagenes?.[0]?.alt_text ||
         `Imagen del producto ${nombreproducto}`;
};
