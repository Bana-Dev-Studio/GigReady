# Phase 01 - Seguimiento de alcance pendiente de la Phase 1

## Objetivo
Cerrar los puntos de la Phase 1 que quedaron más cerca de un objetivo de arquitectura futura que de la experiencia actual del producto, sin modificar el roadmap principal ni duplicar el trabajo ya ejecutado.

## Contexto
La ejecución actual de la Phase 1 ya cubre de forma sólida:
- integración del timeline en la UI,
- playback real de clips desde el modelo de dominio,
- lifecycle de assets y limpieza de memoria,
- observabilidad y feedback resiliente.

Sin embargo, el roadmap original incluía algunos puntos más ambiciosos de sincronización y timeline que hoy siguen pendientes de forma explícita.

## Alcance pendiente

### Batch A - Navegación por secciones y loop regions
### Tareas
- [x] Integrar secciones y regiones de loop desde un contrato de timeline más rico.
- [x] Permitir que la UI navegue por secciones y regiones sin depender de lógica local.
- [x] Definir un contrato de tiempos que incluya inicio/fin de loop y sección.

### Criterios de aceptación
- [x] La navegación musical puede basarse en secciones y límites de loop definidos por el contrato.
- [x] La UI no necesita recomputar esa lógica localmente.

### Estado
- Implementado en [src/services/TimelineService.ts](src/services/TimelineService.ts), [src/components/ClickTrackTimeline.tsx](src/components/ClickTrackTimeline.tsx) y [src/App.tsx](src/App.tsx).
- Verificado con la suite de pruebas de timeline.

### Batch B - Metronomo y sincronización temporal
### Tareas
- [x] Separar la lógica del metronomo en un servicio propio de sincronización.
- [x] Definir un modelo de eventos temporales reutilizable para playback y UI.
- [x] Preparar la base para el scheduling preciso de ticks y markers.

### Criterios de aceptación
- [x] El metronomo y los markers comparten una referencia temporal común.
- [x] La lógica de sincronización es independiente del componente visual.

### Estado
- Implementado en [src/services/TimelineSyncService.ts](src/services/TimelineSyncService.ts) y consumido desde [src/components/ClickTrackTimeline.tsx](src/components/ClickTrackTimeline.tsx) y [src/App.tsx](src/App.tsx).
- Verificado con la suite de pruebas de timeline y sincronización.

### Batch C - Offsets y límites de grabación
### Tareas
- [x] Definir un contrato explícito para offsets de entrada/salida de grabación.
- [x] Alinear ese contrato con el engine de playback y el dominio de clips.
- [x] Preparar la base para soportar recortes y regiones de edición más complejas.

### Criterios de aceptación
- [x] El engine puede recibir y aplicar offsets de forma consistente.
- [x] Los clips y las grabaciones comparten el mismo modelo temporal.

### Estado
- Implementado en [src/services/RecordingTimelineService.ts](src/services/RecordingTimelineService.ts), [src/components/Recorder.tsx](src/components/Recorder.tsx), [src/App.tsx](src/App.tsx) y [src/services/ClipService.ts](src/services/ClipService.ts).
- Verificado con pruebas de contrato de grabación y clips.

## Recomendación de ejecución
Este documento no reemplaza la Phase 1 ejecutada; sirve como extensión de seguimiento para los puntos que quedaron fuera del alcance inmediato del producto actual, pero que sí importan para escalar la sincronización y el dominio musical.

## Definition of Done
La Phase 01 se considera cerrada cuando:
- la navegación por secciones y loop regions queda soportada desde un contrato reutilizable,
- el metronomo tiene una capa de sincronización independiente,
- los offsets de grabación quedan alineados con el engine y el modelo de clips.
