# phase1-tarea3 - Jerarquía visual

## Estado
Completado y archivado.

## Requerimiento
Reordenar el layout para que la sesión, la pista activa y las acciones principales tengan prioridad visual clara.

## Forma de encararlo
- Revisar composición general de pantalla.
- Reducir ruido de controles secundarios.
- Mejorar contraste, espaciado y legibilidad.

## Orientación mínima
- El foco visual debe ser la pista activa.
- Las acciones principales deben ser obvias.
- El diseño debe sostener desktop y mobile.

## Criterios de aceptación
- Se identifica la acción principal sin explicación adicional.
- La UI se percibe más ordenada y legible.
- La experiencia no se rompe en pantallas chicas.

## Resultado aplicado
- Se agregó un hero de sesión activa en [src/App.tsx](../../src/App.tsx).
- Se separó el reproductor principal como bloque visual dominante.
- Se agrupó la acción primaria en un área de mayor jerarquía.