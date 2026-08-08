# Backend Phase A - Contrato mínimo

## Objetivo
Definir el contrato mínimo que el frontend necesita para funcionar sin depender del mock.

## Alcance

### Dentro de esta fase
- `POST /api/stems/process`.
- `GET /api/stems/{trackId}/status`.
- `GET /api/tracks/{trackId}/analysis`.
- Respuesta con `trackId`, `stems[]`, `processingTimeMs`, `metadata` y estados de job.

### Fuera de esta fase
- Escalado de infraestructura.
- Multi-tenant, auth compleja o analytics avanzados.

## Pasos de ejecución

### Paso 1 - Contrato de request/response
- Definir payloads exactos.
- Marcar campos requeridos y opcionales.
- Alinear nomenclatura con el frontend.

### Paso 2 - Estados del job
- Definir `pending`, `processing`, `ready`, `failed`.
- Establecer qué devuelve cada endpoint en cada estado.
- Asegurar que el frontend pueda reintentar o esperar.

### Paso 3 - Metadata musical
- Definir BPM, key y markers mínimos.
- Permitir que el contrato sea extensible sin romper compatibilidad.

## Entregables
- API contract documentado.
- Estados de procesamiento definidos.
- Respuesta compatible con el frontend.

## Criterios de aceptación
- El frontend puede integrarse sin suposiciones ocultas.
- Los estados parciales están contemplados.

## Validación sugerida
- Revisión de contrato por frontend y backend.
- Ejemplos de request/response.