# Backend Phase C - Evolución del contrato

## Objetivo
Hacer que el contrato crezca sin romper integraciones ya existentes.

## Alcance

### Dentro de esta fase
- Versionado de API.
- Soporte para múltiples stems por track.
- Metadata ampliada para BPM variable, secciones y marcadores.
- Compatibilidad retroactiva con el mock actual del frontend.

### Fuera de esta fase
- Nuevas capacidades de producto no previstas en el frontend.

## Pasos de ejecución

### Paso 1 - Versionado
- Definir estrategia de versionado.
- Mantener compatibilidad hacia atrás.

### Paso 2 - Modelo ampliado
- Permitir más de un stem.
- Extender markers y segments sin romper el payload base.

### Paso 3 - Compatibilidad
- Probar con el frontend actual.
- Mantener fallback con mock si el backend aún no resuelve todo.

## Entregables
- API versionada.
- Contrato ampliado y compatible.

## Criterios de aceptación
- La evolución del backend no obliga a reescribir frontend existente.

## Validación sugerida
- Pruebas de compatibilidad.
- Revisión de payloads versionados.