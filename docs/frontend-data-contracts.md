# Frontend Data Contracts

Este documento fija los contratos de datos que consume el frontend para evitar dependencia en mocks específicos.

## Objetivo

- Definir campos obligatorios y opcionales.
- Declarar fallback esperado cuando falten campos opcionales.
- Permitir evolución del backend sin romper UI.

## 1) Beat Analysis Contract

Fuente esperada: `GET /api/tracks/{trackId}/analysis`

### Campos obligatorios

- `trackId: string`
- `durationMs: number` (>= 0)
- `markers: Array<BeatMarker>`

`BeatMarker` obligatorio:

- `beatIndex: number`
- `measure: number`
- `beatInMeasure: number`
- `label: string`
- `timeMs: number`
- `confidence: number` (0..100)

### Campos opcionales

- `bpm?: number`
- `clickTrackUrl?: string | null`
- `bpmSegments?: Array<{ startMs: number; endMs: number; bpm: number }>`

### Fallback y supuestos

- Si `bpm` no está, la UI conserva el BPM previo o fallback local (`120`).
- Si `clickTrackUrl` no está, la UI sigue operativa sin click renderizado del backend.
- Si `markers` llega vacío, la UI no rompe: timeline sin marcas.

## 2) Stem Processing Contract

Fuente esperada: endpoint de procesamiento de stems (actualmente mock local).

### Campos obligatorios

- `trackId: string`
- `originalFileName: string`
- `processingTimeMs: number` (>= 0)
- `stems: Array<Stem>` (al menos 1 usable)

`Stem` obligatorio:

- `id: string`
- `label: string`
- `audioUrl: string` (URL válida no vacía)
- `mimeType: string`
- `durationMs: number` (>= 0)

### Campos opcionales

- `metadata?: { bpm?: number; keySignature?: string }`

### Fallback y supuestos

- Si no hay `metadata.bpm`, la UI no detiene el flujo.
- Si un stem llega sin `audioUrl`, ese stem se descarta como no usable.
- Si no queda ningún stem usable, la respuesta se considera inválida.

## 3) Implementación en frontend

- Contrato central: `src/types/contracts.ts`
- Normalización runtime:
  - `normalizeBeatAnalysisResponse(...)`
  - `normalizeStemProcessingResponse(...)`

La UI consume respuestas ya normalizadas para no acoplarse a detalles del mock/backend.