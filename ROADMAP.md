# Roadmap de producto frontend y contrato backend

Este roadmap separa explícitamente lo que vive en este repo de lo que debe vivir en un proyecto externo de API.

- Este repo es el frontend del producto.
- El backend se desarrolla aparte, pero debe respetar el contrato definido aquí.
- La UX, la performance y el modelo de sesión son responsabilidad del frontend.
- El procesamiento de stems, análisis y storage son responsabilidad del backend externo.

## 1. Alcance

### Frontend: sí pertenece a este repo
- UI y UX comercializable.
- Reproductor, timeline, sesión, selección y edición ligera.
- Estado de la app, persistencia local, recuperación de sesión y observabilidad de errores.
- Adaptadores para consumir la API externa.
- Rendimiento visual, accesibilidad y consistencia de interacción.

### Backend: no pertenece a este repo
- Upload y procesamiento de stems.
- Análisis musical y generación de metadata.
- Persistencia de archivos, jobs y estados de procesamiento.
- CDN/Blob storage, colas y reintentos.
- Autenticación, autorización y versionado de API.

## 2. Estado actual

### Lo que ya está bien encaminado
- La base de dominio y transporte ya existe.
- Hay separación razonable entre audio, estado y UI.
- El proyecto ya modela clips, timeline, sesión y assets.
- El frontend ya puede evolucionar sin reescribir el core.

### Lo que falta para el MVP comercial
1. Definir una UX más clara para carga, selección y cambio de stems.
2. Hacer que la interfaz exprese estados de backend reales: loading, ready, partial, error, retry.
3. Ordenar la navegación del producto para que se entienda rápido qué hacer con una pista.
4. Consolidar la persistencia de sesión y la recuperación de contexto.
5. Cerrar el contrato con el backend para no depender del mock.

## 3. Roadmap frontend

### Fase 0 - Base técnica consolidada
Objetivo: mantener estable el motor, el timeline y la sesión.

- [x] Modelo de dominio para sesión, timeline, clips, tracks y transporte.
- [x] Transporte centralizado y desacoplado de React.
- [x] Gestión de assets con cache, limpieza y observabilidad.
- [x] Timeline musical y sincronización temporal.

### Fase 1 - UX de producto
Objetivo: que el usuario entienda el valor del producto en segundos.

- [ ] Flujo de carga claro para archivos y stems.
- [ ] Selector visual de stems con estados por recurso.
- [ ] Empty states, loading states y error states consistentes.
- [ ] Jerarquía visual más fuerte para sesión, pista activa y acciones primarias.
- [ ] Responsive layout y accesibilidad básica completa.

### Fase 2 - Interacción musical útil
Objetivo: convertir el reproductor en una herramienta de trabajo real.

- [ ] Selección, mute, trim y move de clips desde una experiencia clara.
- [ ] Timeline legible por compás, beat, secciones y loop regions.
- [ ] Persistencia de sesión y recuperación al recargar.
- [ ] Feedback no invasivo de fallos y recuperación.
- [ ] Atajos y navegación rápida para uso intensivo.

### Fase 3 - Performance y escalado visual
Objetivo: mantener fluidez con más pistas, clips y estados.

- [ ] Un único reloj visual para playback y cursor.
- [ ] Reducir re-renders innecesarios por estado local.
- [ ] Optimizar waveform, cursor y timeline cuando crezca el volumen de datos.
- [ ] Preparar virtualización o canvas si la densidad visual lo exige.
- [ ] Vigilar memoria y limpieza de recursos de audio.

### Fase 4 - Release readiness
Objetivo: dejar el frontend listo para comercialización.

- [ ] Métricas internas de carga, decode y playback.
- [ ] Observabilidad de errores y fallback seguro.
- [ ] Contratos estables de datos para la API externa.
- [ ] Validación de estados críticos antes de publicar.
- [ ] Documentación de integración para el backend externo.

## 4. Roadmap del backend externo

Este track no se desarrolla en este repo. Aquí solo se define el contrato que el frontend consumirá.

### Fase A - Contrato mínimo
- `POST /api/stems/process` para subir un archivo y pedir procesamiento.
- `GET /api/stems/{trackId}/status` para consultar progreso.
- `GET /api/tracks/{trackId}/analysis` para obtener metadata musical y marcas.
- Respuesta con `trackId`, `stems[]`, `processingTimeMs`, `metadata` y estados de job.

### Fase B - Infraestructura de proceso
- Cola o job system para análisis pesado.
- Almacenamiento de audios y stems generados.
- URLs estables o firmadas para consumo del frontend.
- Manejo de retries, timeouts y estados parciales.

### Fase C - Evolución del contrato
- Versionado de API.
- Soporte para múltiples stems por track.
- Metadata ampliada para BPM variable, secciones y marcadores.
- Compatibilidad retroactiva con el mock actual del frontend.

## 5. Reglas de integración

- El frontend nunca debe asumir que siempre habrá un solo stem.
- El frontend nunca debe hardcodear BPM, key o duration si el backend puede proveerlos.
- El backend debe respetar el contrato, no la implementación interna del frontend.
- El mock local debe servir solo para desarrollo y fallback, no como diseño definitivo.
- La UI debe sobrevivir a estados parciales o fallidos sin romper la sesión.

## 6. Prioridades recomendadas

1. Cerrar la UX de carga y selección de stems.
2. Formalizar el contrato del backend externo.
3. Mejorar persistencia de sesión y recuperación.
4. Optimizar la experiencia visual y el rendimiento.
5. Preparar la release comercial con estados, errores y métricas.

## 7. Execution plans

Los planes de ejecución detallados están en [docs/execution-plans/README.md](docs/execution-plans/README.md). Ahí se encuentran los pasos por fase, el alcance y los criterios de aceptación para que cualquier desarrollador pueda tomar una fase completa sin perder contexto.

> La separación correcta no es frontend contra backend; es frontend dueño de la experiencia y backend dueño del procesamiento.
