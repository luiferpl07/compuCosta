# Scroll Restoration en Productos

## Objetivo
Corregir el comportamiento del scroll al volver desde la página de detalle de producto al listado, evitando el salto hacia arriba y el parpadeo visual.

## Implementación realizada

### 1. Tarjetas de producto clickeables
Se mejoró la UX de las tarjetas para que el texto también navegue al detalle, no solo la imagen.

Archivo:
- `src/ui/ProductCard.tsx`

Cambios principales:
- El título, la categoría y el bloque de rating ahora son clickeables.
- Se añadió soporte de teclado con `Enter` y `Espacio`.

### 2. Restauración del scroll al volver al listado
Se implementó una restauración controlada del scroll al regresar desde detalle al listado.

Archivo:
- `src/pages/Producto.tsx`

Comportamiento final:
- Se guarda el estado necesario del listado al abrir un producto.
- Al volver desde detalle, se hidratan filtros y página actual.
- El scroll se restaura una sola vez cuando la grilla ya está renderizada.
- Se usa un anclaje al producto clicado como referencia principal.
- Si el anclaje no existe, se usa el valor de `scrollY` como respaldo.

### 3. Evitar que el loader rompa la posición
Se ajustó el renderizado para no reemplazar la grilla completa por un loader grande durante la vuelta al listado, porque eso alteraba la posición visual.

Archivo:
- `src/pages/Producto.tsx`

## Resultado
- El listado vuelve a la posición esperada al regresar desde un producto.
- El scroll ya no sube al inicio de forma inesperada.
- El texto de las tarjetas quedó clickeable, reduciendo confusión.

## Validación
Se verificó que el proyecto compila correctamente con:
- `npm run build`
