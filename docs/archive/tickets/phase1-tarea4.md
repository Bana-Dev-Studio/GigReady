# phase1-tarea4 - Estados resilientes

## Estado
Completado y archivado.

## Requerimiento
Mostrar loading, partial y error de forma consistente, sin bloquear la app.

## Forma de encararlo
- Unificar mensajes y fallback.
- Reemplazar alertas intrusivas por feedback contextual.
- Mantener visible la opción de reintentar o seguir trabajando.

## Orientación mínima
- Cada fallo debe dejar al usuario con un camino de salida.
- El contenido útil debe seguir accesible aunque una parte falle.
- La UI no debe quedarse congelada por estados parciales.

## Criterios de aceptación
- Los errores son visibles y recuperables.
- La app sigue siendo utilizable con fallas parciales.
- No hay bloqueos innecesarios por loading.

## Resultado aplicado
- El loading ya no bloquea toda la interfaz con un overlay full-screen.
- Los errores de procesamiento se muestran como banner recuperable.
- Los fallos de validación y procesamiento usan feedback contextual en lugar de alertas intrusivas.