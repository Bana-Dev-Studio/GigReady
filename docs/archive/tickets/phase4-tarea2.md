# phase4-tarea2 - Observabilidad

## Estado
Completado y archivado.

## Requerimiento
Registrar carga, decode, playback y errores para poder operar el producto con confianza.

## Forma de encararlo
- Definir eventos útiles y de bajo ruido.
- Registrar fallos con suficiente contexto.
- Mantener trazabilidad de los fallbacks.

## Orientación mínima
- Lo importante debe poder auditarse.
- La observabilidad no debe molestar al usuario.
- Los errores deben quedar ligados a un scope.

## Criterios de aceptación
- Hay evidencia de eventos críticos.
- Los errores se pueden rastrear.
- El fallback deja señales útiles.

## Resultado aplicado
- Se agregó `buildFeedbackNoticeWithTelemetry(...)` para emitir señales de fallback cada vez que se crea un notice de recuperación.
- Se instrumentó ciclo de carga/procesamiento (`started`, `succeeded`, `failed`, `completed`) en app y motor de audio.
- Se añadieron métricas de playback (`start`, `pause`, `seek`, `source-replaced`) y de carga de waveform (`load-requested`, `progress`, `ready`, `reset`).
- Se sumó test de fallback telemetry en `FeedbackMessages.test.ts`.