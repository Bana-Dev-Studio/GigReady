# Phase 1 - Plan de ejecución para timeline, playback y clips

Este documento es la capa operativa de la Fase 1 del roadmap: convertir la base arquitectónica en una experiencia de reproducción y navegación más realista para el usuario, sin reescribir el producto.

## Objetivo
Tomar la base de la Phase 0 y convertirla en una experiencia de reproducción y navegación más realista para el usuario, sin reescribir el producto.

## Principios
- Mantener la UX actual intacta.
- Centralizar la lógica de reproducción y timeline en servicios y store.
- Evitar acoplar más lógica de audio a componentes React.
- Verificar cada batch con tests y build.

## Batch 1 - Integración del timeline en la UI
### Tareas
- [x] Conectar el servicio de timeline con el estado de transporte y el playhead.
- [x] Exponer la posición actual en beats/compases/medidas para la UI.
- [x] Preparar un selector de navegación por secciones y markers.
- [x] Mantener el mock actual como fuente de datos temporal.

### Criterios de aceptación
- La UI puede leer el estado musical actual desde un servicio y no desde lógica local.
- El playhead y los markers comparten la misma referencia temporal.

## Batch 2 - Playback real de clips desde el estado del proyecto
### Tareas
- [x] Integrar clips de grabación con el motor de audio.
- [x] Permitir que un clip se agenda y reproduzca a partir de su offset y duración.
- [x] Separar con claridad la creación del clip de su renderización en audio.
- [x] Asegurar que el estado del proyecto siga siendo la fuente de verdad.

### Criterios de aceptación
- Un clip creado desde el dominio puede reproducirse desde el motor sin lógica dispersa.
- La reproducción de clips no rompe el playback principal.

## Batch 3 - Lifecycle de assets y limpieza de memoria
### Tareas
- [x] Conectar el gestor de assets al cambio de proyecto o canción.
- [x] Limpiar buffers y recursos cuando el usuario cambia de sesión.
- [x] Evitar descargas y decodificaciones innecesarias al reutilizar assets.
- [x] Registrar eventos de lifecycle para debug.

### Criterios de aceptación
- El cambio de proyecto no deja recursos vivos acumulados.
- Los assets reutilizables se mantienen en cache de forma segura.

### Verificación ejecutada
- Se añadió una regresión de lifecycle para validar el dispose del asset manager.
- Se validó con Vitest y con el build de producción.

## Batch 4 - Hardening y observabilidad de UX
### Tareas
- [x] Mostrar estados de carga/error en la UI de forma no invasiva.
- [x] Asegurar que fallos puntuales no rompan la reproducción completa.
- [x] Centralizar mensajes de fallback y recuperación.

### Criterios de aceptación
- El usuario recibe feedback útil si algo falla.
- El sistema continúa operativo aunque un recurso falle de forma parcial.

### Verificación ejecutada
- Se añadió una regresión de mensajes de feedback no invasivos.
- Se validó con Vitest y con el build de producción.

## Orden recomendado
1. Integración del timeline en la UI.
2. Playback real de clips desde estado del proyecto.
3. Lifecycle de assets y memoria.
4. Hardening y observabilidad de UX.

## Definition of Done
La Phase 1 se considera lista cuando:
- el timeline ya está integrado con playback y UI,
- los clips se pueden reproducir desde un modelo de dominio,
- los assets se gestionan con cache y limpieza,
- el sistema ofrece observabilidad útil sin romper la experiencia.

## Estado verificado
La implementación de la Phase 1 quedó validada por la regresión documentada en [docs/phase01_regression.md](docs/phase01_regression.md).

## Regresión asociada
La regresión específica de esta ejecución quedó documentada en [docs/phase01_regression.md](docs/phase01_regression.md).
