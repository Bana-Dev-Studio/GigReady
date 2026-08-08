# phase3-tarea4 - Escalar render

## Estado
Completado y archivado.

## Requerimiento
Preparar la UI para crecer en densidad visual sin perder fluidez ni memoria controlada.

## Forma de encararlo
- Evaluar si hace falta canvas o virtualización.
- Proteger el lifecycle de recursos de audio.
- Verificar comportamiento con más pistas y clips.

## Orientación mínima
- No forzar optimizaciones prematuras.
- Asegurar limpieza de memoria.
- Mantener estabilidad al crecer el proyecto.

## Criterios de aceptación
- La UI sigue usable con alta densidad de elementos.
- La memoria no crece de forma descontrolada.
- La navegación continúa siendo fluida.

## Resultado aplicado
- Se implementó render progresivo para la lista de pistas grabadas, mostrando lotes y permitiendo expandir o colapsar según densidad.
- Se agregó control de referencias para URLs `blob:` de grabaciones, liberando memoria al eliminar pistas y al desmontar.
- Se optimizó el acceso a clips en render usando un mapa indexado para evitar búsquedas repetidas por cada fila.