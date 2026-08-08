# phase3-tarea2 - Unificar el reloj visual

## Requerimiento
Hacer que playback, cursor y timeline compartan una sola referencia temporal visual.

## Forma de encararlo
- Revisar la fuente de tiempo actual.
- Eliminar duplicación de relojes visuales.
- Ajustar el cursor para que siga el playback real.

## Orientación mínima
- Una sola verdad temporal para la UI.
- Evitar jitter y desfasajes visibles.
- Mantener consistencia entre engine y pantalla.

## Criterios de aceptación
- No hay diferencias visibles entre audio y cursor.
- El timeline responde de manera estable.
- El avance visual es consistente.