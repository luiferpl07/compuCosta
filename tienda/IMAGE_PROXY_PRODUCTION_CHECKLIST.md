# Checklist: Despliegue en Producción — Image Proxy

Este documento resume todo lo que debes verificar y configurar antes y durante el despliegue del image proxy (backend admin) y la integración frontend.

## 1) Endpoints y comportamiento
- Asegurar que el admin expone `GET /api/img` (o `app/api/img/route.ts`) que devuelve los bytes de la imagen y el header `Content-Type` correcto.
- Soportar el parámetro `u` (Base64) y/o `url` según lo implementado en el admin. El frontend debe generar la misma forma (actualmente usamos `u=BASE64`).
- Responder siempre con `200` + `Content-Type: image/...` para imágenes válidas. No devolver HTML ni páginas de error.

## 2) Variables de entorno (mínimas)
- En el admin (Next):
  - `IMAGE_PROXY_CACHE_TTL` (segundos)
  - `IMAGE_PROXY_MAX_BYTES` (bytes)
  - `ALLOWED_IMAGE_DOMAINS` (lista separada por comas) — en producción no dejar vacío ni `*`
  - `IMAGE_PROXY_CACHE_DIR` (opcional) — ruta absoluta al cache en disco
  - `CORS_ALLOW_ORIGIN` — orígenes permitidos si el proxy es accedido desde JS
- En el frontend (build):
  - `VITE_IMAGE_PROXY_HOST=https://admin.tudominio.com` (production absolute host)
  - `VITE_FORCE_IMAGE_PROXY=true`

## 3) Seguridad y validaciones
- Rechazar esquemas no-HTTPS. Solo permitir `https:`.
- Validar que `hostname` pertenezca a `ALLOWED_IMAGE_DOMAINS` (o una lista controlada).
- Ejecutar verificación DNS para evitar resolución a IPs privadas (`hostResolvesToPrivateIp`).
- Limitar tamaño de imágenes (`IMAGE_PROXY_MAX_BYTES`) y devolver `413`/`4xx` apropiado.
- Implementar rate limiting por IP para evitar abuso (Cloudflare, Nginx limit, o middleware en Node).

## 4) Cache y almacenamiento
- Cache en disco: `public/uploads/proxy` o ruta configurada.
- Asegurar permisos de escritura/lectura del proceso en ese directorio.
- Evitar exposiciones públicas del directorio (no listar contenido). Usar rutas controladas por el handler.
- Evicción: TTL por archivo (`IMAGE_PROXY_CACHE_TTL`) y política de limpieza/rotación si el disco crece.

## 5) Headers y comportamiento HTTP
- `Content-Type`: copiar el valor recibido del origen o inferirlo.
- `Cache-Control`: `public, max-age=<IMAGE_PROXY_CACHE_TTL>`.
- `Content-Disposition: inline` para mostrar en navegador.
- `X-Content-Type-Options: nosniff`.
- CORS: solo si el frontend hace fetch; para `<img>` no es obligatorio, pero si habilitas CORS usa `CORS_ALLOW_ORIGIN` restrictivo.

## 6) Streaming, performance y límites
- Preferir streaming cuando no se cachea: responde al cliente mientras se descarga desde el origen.
- Si cacheas: escribir en archivo temporal y renombrar atómicamente (ya implementado: `.tmp` → renombrar).
- Controlar concurrency y timeout (ej. 10s) para evitar bloqueos de worker/process.

## 7) Optimización y CDN
- Considerar conversión/optimización a `webp` en el proxy, si conviene.
- Poner un CDN (CloudFront, Fastly, etc.) delante del admin para cache largo y reducción de carga.
- Configurar invalidación de cache al actualizar imágenes si aplica.

## 8) Logging, monitorización y alertas
- Registrar métricas: tasa de peticiones, latencia, 4xx/5xx, tamaño medio.
- Logs de errores con contexto (url solicitada, código de error, stacktrace) en Sentry/ELK.
- Alertas para picos de 5xx o errores DNS repetidos.

## 9) Privacidad y autentificación
- Si el origen requiere autenticación, no incluir credenciales del usuario en la petición simple.
- Para recursos privados, usar URLs firmadas o un flujo que valide el acceso antes de proxyear.

## 10) Pruebas y verificación post-deploy
- Comprobar directamente contra el admin:
  ```bash
  curl -I "https://admin.tudominio.com/api/img?u=$(node -e "console.log(Buffer.from('https://ejemplo.com/imagen.jpg').toString('base64'))")"
  ```
  Debes ver `HTTP/2 200`/`200` y `Content-Type: image/...`.
- Comprobar desde el frontend en producción: la URL final en `src` debe apuntar a `https://admin.tudominio.com/api/img?u=...`.
- Prueba de carga y pruebas de edge cases (imágenes muy grandes, URLs inválidas, hosts que resuelven a IP privadas).

## 11) CI/CD y variables de build
- Asegurar que `VITE_IMAGE_PROXY_HOST` y `VITE_FORCE_IMAGE_PROXY` estén presentes en el entorno de build (pipeline) para que el frontend genere URLs absolutas en producción.
- No cometer `.env.production` con secretos en el repo; usar secretos del proveedor CI.

## 12) Despliegue gradual y rollback
- Deploy canary o staging antes de full rollout.
- Verificar smoke tests (curl + abrir página con imágenes) en staging.
- Tener plan de rollback si se detectan errores 5xx generalizados.

## 13) Consideraciones adicionales
- Revisar `ALLOWED_IMAGE_DOMAINS` en producción para solo permitir dominios conocidos.
- Revisar límites de almacenamiento y presupuesto del hosting por el cache.
- Revisar legal/privacy si haces re-hosting de contenido de terceros.

---
Fecha de generación: 2026-03-23
