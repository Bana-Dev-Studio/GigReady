# phase2-tarea2 - Timeline operativo

## Estado
Completado y archivado.

## Requerimiento
Hacer que el timeline funcione como referencia musical estable para navegación y playback.

## Forma de encararlo
- Alinear beats, compases, secciones y loop regions.
- Verificar que el timeline use la misma referencia temporal que el engine.
- Revisar los saltos desde UI para que sean previsibles.

## Orientación mínima
- No duplicar cálculos de tiempo en la UI.
- El timeline debe reaccionar, no inventar estado.
- Seek, loop y playback deben compartir modelo.

## Criterios de aceptación
- La navegación musical es consistente.
- El playhead y el timeline no divergen.
- Los saltos desde UI llegan al punto esperado.

## Resultado aplicado
- El clock visual del timeline ahora usa el BPM y la firma temporal del proyecto.
- El playhead visual del timeline sigue el contrato del proyecto en lugar de un valor fijo.