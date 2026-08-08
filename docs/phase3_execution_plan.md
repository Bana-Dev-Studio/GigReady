# Phase 3 - Plan de ejecución para producto frontend y edición real

## Objetivo
Convertir la base ya consolidada en una experiencia más cercana a un DAW, sin perder modularidad ni rendimiento. Esta fase pertenece al frontend: usa el contrato externo del backend, pero no define ni implementa la API.

## Principios
- Mantener la experiencia actual funcional y estable.
- Usar como fuente de verdad los servicios y tipos ya presentes en [src/types/project.ts](src/types/project.ts), [src/services/ClipService.ts](src/services/ClipService.ts), [src/services/ProjectDomainService.ts](src/services/ProjectDomainService.ts), [src/services/SessionRecoveryService.ts](src/services/SessionRecoveryService.ts) y [src/services/TimelineSyncService.ts](src/services/TimelineSyncService.ts).
- Tratar edición, selección y sesión como dominio propio, no como lógica de UI.
- Reducir carga innecesaria y evitar re-decodificaciones.
- Mantener la separación entre UI, motor de audio, modelo de dominio y contrato de API externa.

## Estado base ya disponible
- El modelo de clip ya existe con tiempos, offsets y duración.
- El timeline y la sincronización temporal ya cuentan con un contrato estable.
- La recuperación de sesión ya existe como servicio reutilizable.
- El dominio de proyecto ya permite crear clips y tracks de forma aislada.
- El frontend ya puede consumir stems y análisis desde un backend externo sin acoplarse a su implementación.

Este plan debe trabajar sobre esa base, no volver a definirla desde cero.

## Batch 1 - Sesión y persistencia de producto
### Tareas
- [x] Definir un snapshot estable de sesión que cubra proyecto, tracks, clips, transport y selección.
- [x] Persistir cambios de sesión con debounce y recuperación sobre recarga usando la capa de recuperación existente.
- [x] Separar claramente estado “en curso” de estado “persistido” para evitar mezclar UI y dominio.

### Criterios de aceptación
- La sesión puede recuperarse tras recarga sin perder contexto esencial.
- El flujo de persistencia no bloquea la experiencia de edición.
- El modelo de persistencia reutiliza el estado del dominio ya existente.

## Batch 2 - Edición de clips y pistas
### Tareas
- [x] Introducir selección, hover y estado de edición para clips y tracks a nivel de dominio.
- [x] Encapsular operaciones ligeras de edición (trim, move, mute) en servicios del dominio, ampliando el contrato actual de clips.
- [x] Permitir que la UI reaccione a cambios de edición a través del mismo contrato de eventos y del estado del proyecto.

### Criterios de aceptación
- Los clips pueden editarse sin mezclar lógica de UI con lógica de dominio.
- La interacción sigue siendo predecible y escalable.
- El estado de edición queda representado en el dominio y no solo en componentes visuales.

## Batch 3 - Integración con timeline y metadatos
### Tareas
- [x] Añadir metadatos de sesión y clips para soporte de búsqueda, trazabilidad y futuras operaciones de exportación.
- [x] Conectar edición y timeline con un modelo común de tiempo y selección.
- [x] Preparar la base para integrar un backend externo o exportación sin reescribir el modelo.

### Criterios de aceptación
- El sistema puede evolucionar hacia un flujo de mezcla más completo sin reescribir el modelo.
- La base de timeline y clips queda alineada con la arquitectura de dominio.
- Los metadatos no duplican información ya capturada en el contrato de clips o timeline.
- La integración con la API externa depende solo del contrato, no de detalles internos del servicio.

## Definition of Done
La Phase 3 se considera lista cuando:
- la sesión es persistible y recuperable,
- la edición de clips y pistas se modela en servicios reutilizables,
- la arquitectura sigue siendo escalable para un backend externo, exportación posterior y edición más compleja.
