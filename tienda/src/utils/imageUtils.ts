import { config } from "../../config";
import { Product } from "../../type";

const FORCE_IMAGE_PROXY = (import.meta.env?.VITE_FORCE_IMAGE_PROXY === 'true');
const IMAGE_PROXY_HOST = (import.meta.env?.VITE_IMAGE_PROXY_HOST) ?? config.baseUrl;

function toProxyUrlIfNeeded(original: string) {
  try {
    if (!original) return original;
    if (!original.startsWith('http')) return original;
    // Decide whether to use proxy: either a proxy host is provided or force flag is set
    const shouldProxy = Boolean(IMAGE_PROXY_HOST) || FORCE_IMAGE_PROXY;
    if (shouldProxy) {
      const host = IMAGE_PROXY_HOST?.replace(/\/$/, '') || '';
      const prefix = config.apiPrefix ?? '/api';
      const base = host || '';
      // Encode the original URL in Base64 using a UTF-8 safe method
      const encodeBase64 = (s: string) => {
        try {
          if (typeof window !== 'undefined' && window.btoa) {
            return window.btoa(unescape(encodeURIComponent(s)));
          }
        } catch (e) {}
        // Fallback for non-browser contexts
        try {
          // @ts-ignore
          return Buffer.from(s, 'utf-8').toString('base64');
        } catch (e) {
          return btoa(s);
        }
      };

      const b64 = encodeBase64(original);
      // If we have a host, return absolute proxy URL using `u` param (base64)
      if (base) {
        return `${base}${prefix.replace(/\/$/, '')}/img?u=${encodeURIComponent(b64)}`;
      }
      // Relative proxy path for dev (vite proxy will forward to admin)
      return `/api/img?u=${encodeURIComponent(b64)}`;
    }
    return original;
  } catch (e) {
    return original;
  }
}

export function toProxyUrlIfNeededExported(original: string) {
  return toProxyUrlIfNeeded(original);
}

export const getProductImage = (imagenes: Product["imagenes"] | undefined) => {
  if (!imagenes?.length) return 'ruta-a-imagen-por-defecto';

  const principal = imagenes.find(img => img.es_principal)?.url;
  if (principal) return toProxyUrlIfNeeded(principal.startsWith("http") ? principal : `${config?.baseUrl}${principal}`);

  const primeraImagen = imagenes[0]?.url;
  return toProxyUrlIfNeeded(primeraImagen.startsWith("http") ? primeraImagen : `${config?.baseUrl}${primeraImagen}`);
};

export const getProductImageAlt = (imagenes: Product["imagenes"] | undefined, nombreproducto: string) => {
  return imagenes?.find(img => img.es_principal)?.alt_text ||
         imagenes?.[0]?.alt_text ||
         `Imagen del producto ${nombreproducto}`;
};

// Alias for components
export const proxyImageUrl = toProxyUrlIfNeeded;

export default {
  getProductImage,
  getProductImageAlt,
  proxyImageUrl,
};
