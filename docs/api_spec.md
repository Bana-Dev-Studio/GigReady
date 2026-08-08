API Spec - Beat Analysis Service

Overview
- Servicio REST para devolver una pista de click renderizada (opcional) y marcas de beat en milisegundos.
- Backend: .NET 8/10 (suggested implementation: ASP.NET Core Minimal APIs / Controllers).

Endpoints

GET /api/tracks/{trackId}/analysis
- Descripción: Devuelve el análisis rítmico del track identificado por {trackId}.
- Response (200): application/json

Response schema
{
  "trackId": "string",
  "durationMs": 0,
  "bpm": 0, // opcional, puede omitirse o ser 0 si no hay BPM único
  "clickTrackUrl": "string | null", // URL al archivo audio renderizado (mp3/wav)
  "markers": [
    {
      "beatIndex": 1,
      "measure": 1,
      "beatInMeasure": 1,
      "label": "1",
      "timeMs": 0,
      "confidence": 0 // 0-100
    }
  ],
  "bpmSegments": [
    {
      "startMs": 0,
      "endMs": 15000,
      "bpm": 120
    }
  ]
}

Notes
- `clickTrackUrl` es opcional; si el servidor devuelve un audio renderizado, el cliente puede cargarlo como `AudioBuffer` y reproducir sincronizando `audioBufferSource.start(absoluteStartTime)` con su propio `AudioContext`.
- `markers` debe contener marcas en ms absolutas desde el inicio del archivo para facilitar triggers y visualizaciones.
- `bpmSegments` es opcional pero útil para canciones con BPM variables; define segmentos con BPM constantes.

Implementation notes (.NET)
- Endpoint simple que lee metadatos de un análisis previo o lanza un job para generar marcas. Si la generación es costosa, devolver `202 Accepted` y exponer un `GET /api/tracks/{trackId}/analysis/status` hasta completar.
- Almacenar `clickTrack` en CDN/Blob storage y devolver la URL.

Client usage (example)
- Fetch `/api/tracks/{id}/analysis`
- If `clickTrackUrl` present: fetch audio URL, decode to `AudioBuffer` and play synced.
- Use `markers` array to schedule events: convert `timeMs` -> seconds and call `osc.start(audioCtx.currentTime + (timeMs/1000) - offset)` where `offset` aligns with current playback time.

Frontend contract lock
- Ver contrato final consumido por UI en `docs/frontend-data-contracts.md`.
- Ver flujo operativo de integración en `docs/frontend-backend-integration.md`.

