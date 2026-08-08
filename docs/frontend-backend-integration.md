# Frontend Backend Integration Guide

Guía operativa para integrar el frontend con la API externa sin depender del mock actual.

## Alcance

- Qué endpoints consume el frontend.
- Qué estados debe manejar la UI.
- Cómo aplicar retry, polling y fallback.
- Qué parte resuelve frontend y qué parte resuelve backend.

## Contratos base

- Contrato técnico de análisis rítmico: `docs/api_spec.md`
- Contrato consumido por UI: `docs/frontend-data-contracts.md`

## Endpoint principal

### GET `/api/tracks/{trackId}/analysis`

Objetivo:

- Traer estado de análisis rítmico de una pista.

Respuestas esperadas:

- `200 OK`: análisis listo
- `202 Accepted`: análisis en progreso (si el backend trabaja async)
- `404 Not Found`: track inexistente
- `5xx`: error temporal del backend

Payload `200`:

- `trackId: string` obligatorio
- `durationMs: number` obligatorio
- `markers: BeatMarker[]` obligatorio
- `bpm?: number` opcional
- `clickTrackUrl?: string | null` opcional
- `bpmSegments?: BpmSegment[]` opcional

## Flujo recomendado (frontend)

1. Subir/procesar audio y obtener `trackId`.
2. Consultar `/api/tracks/{trackId}/analysis`.
3. Si `200`, normalizar payload y renderizar timeline/click track.
4. Si `202`, iniciar polling de estado hasta completar.
5. Si `404` o `5xx`, mostrar fallback recuperable y permitir retry.

## Polling recomendado (si hay 202)

Endpoint sugerido backend:

- `GET /api/tracks/{trackId}/analysis/status`

Estados sugeridos:

- `queued`
- `processing`
- `completed`
- `failed`

Política de polling sugerida:

- Intentos máximos: `10`
- Intervalo base: `1500ms`
- Backoff: lineal o exponencial suave
- Timeout global: `30s`

Reglas UI:

- Mantener la sesión usable mientras se espera el análisis.
- Mostrar mensaje no bloqueante durante `queued/processing`.
- Si llega `failed`, emitir fallback con acción de reintento.

## Retry recomendado

Casos con retry automático limitado:

- `GET analysis` con `5xx`, `429` o error de red.

Política sugerida:

- Reintentos automáticos: `2`
- Delay: `500ms`, `1500ms`
- Luego, degradar a retry manual desde la UI.

Casos sin retry automático:

- `400`/`404` por datos inválidos o no encontrados.

## Fallback esperado en frontend

Cuando falta información opcional:

- Sin `bpm`: conservar BPM previo o fallback local `120`.
- Sin `clickTrackUrl`: seguir sin click renderizado externo.
- Sin `bpmSegments`: usar tempo global.
- `markers` vacío: timeline renderiza estado vacío, sin crash.

Cuando hay error de backend:

- Mostrar notice recuperable (no bloqueo total).
- Registrar evento y métrica de fallback.
- Conservar controles básicos de sesión cuando sea posible.

## Observabilidad mínima requerida

Scopes actuales esperados:

- `audio-load`
- `audio-playback`
- `loading`
- `fallback`

Eventos críticos a conservar:

- inicio/fin de carga
- éxito/fallo de procesamiento
- fallos de playback
- emisión de notices de recuperación

## Responsabilidades por capa

Frontend:

- Normalizar payloads (`normalizeBeatAnalysisResponse`, `normalizeStemProcessingResponse`).
- Aplicar fallback de contrato opcional.
- Mostrar estado recuperable y acciones de retry.
- Emitir telemetría funcional mínima.

Backend:

- Garantizar shape contractual para campos obligatorios.
- Devolver códigos HTTP consistentes (`200`, `202`, `4xx`, `5xx`).
- Exponer endpoint de status si el análisis es asíncrono.
- Entregar URLs accesibles para `clickTrackUrl`.

## Smoke test manual de integración

1. Cargar audio válido y confirmar `trackId`.
2. Resolver análisis con `200` y validar timeline.
3. Simular `202` y verificar polling + transición a listo.
4. Simular `5xx` y validar retry + fallback.
5. Simular `markers: []` y confirmar UI estable.

## Criterio de salida

La integración está lista cuando otro desarrollador puede conectar backend real siguiendo este documento sin depender de contexto oral adicional.