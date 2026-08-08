# Backend Phase B - Infraestructura de proceso

## Objetivo
Hacer operable el procesamiento de stems y análisis de audio de forma confiable.

## Alcance

### Dentro de esta fase
- Cola o job system para análisis pesado.
- Almacenamiento de audios y stems generados.
- URLs estables o firmadas para consumo del frontend.
- Manejo de retries, timeouts y estados parciales.

### Fuera de esta fase
- Nuevos contratos de frontend.
- Cambios de UX.

## Pasos de ejecución

### Paso 1 - Jobs
- Definir cómo se encola un análisis.
- Asegurar idempotencia básica.
- Registrar el estado del job.

### Paso 2 - Storage
- Elegir dónde se guardan originales y stems.
- Asegurar URLs consumibles desde el frontend.
- Definir limpieza o caducidad si aplica.

### Paso 3 - Robustez
- Implementar retries y timeouts.
- Evitar jobs huérfanos.
- Permitir consulta de estado sin bloquear.

## Entregables
- Pipeline de procesamiento estable.
- Storage y URLs listos para frontend.
- Estados parciales y reintentos operativos.

## Criterios de aceptación
- El backend puede procesar y servir stems de forma confiable.
- El frontend no depende de timing implícito.

## Validación sugerida
- Test de job lifecycle.
- Test de storage/URL.