# phase2-tarea4 - Recuperación y feedback

## Requerimiento
Mostrar fallos y recuperación de forma no invasiva para que la app siga siendo operable.

## Forma de encararlo
- Unificar mensajes de carga, error y fallback.
- Evitar alertas que corten la experiencia salvo casos extremos.
- Mantener acciones de retry siempre visibles.

## Orientación mínima
- El usuario debe entender qué pasó y qué puede hacer.
- Las fallas parciales no deben cerrar la app.
- El sistema debe poder volver a un estado usable.

## Criterios de aceptación
- Los errores se comunican sin bloquear.
- La app ofrece recuperación clara.
- El feedback es coherente en toda la UI.