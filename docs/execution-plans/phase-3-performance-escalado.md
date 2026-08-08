# Phase 3 - Performance y escalado visual

## Objetivo
Mantener una experiencia fluida cuando crezcan las pistas, los clips y los estados de sesión.

## Alcance

### Dentro de esta fase
- Un único reloj visual para playback y cursor.
- Reducir re-renders innecesarios por estado local.
- Optimizar waveform, cursor y timeline cuando crezca el volumen de datos.
- Preparar virtualización o canvas si la densidad visual lo exige.
- Vigilar memoria y limpieza de recursos de audio.

### Fuera de esta fase
- Cambios de negocio en clips o sesión.
- Nuevos endpoints del backend.
- Rediseño de UX principal.

## Pasos de ejecución

### Paso 1 - Medir antes de tocar
- Identificar renders innecesarios.
- Medir carga, decode y playback.
- Confirmar qué estados cambian con más frecuencia.

### Paso 2 - Unificar el reloj visual
- Revisar que playback, cursor y timeline compartan la misma referencia.
- Evitar múltiples fuentes de tiempo en paralelo.
- Reducir jitter visual.

### Paso 3 - Minimizar re-renders
- Particionar estado por responsabilidad.
- Usar selectores donde realmente reduzcan ruido.
- Evitar recalcular UI pesada sin necesidad.

### Paso 4 - Escalar render
- Preparar fallback a canvas o virtualización si el volumen visual lo requiere.
- Proteger memoria y liberación de recursos.
- Verificar que la navegación siga siendo estable con más datos.

## Entregables
- Reloj visual único.
- Menos re-renders por interacción.
- Waveform y timeline más estables.
- Limpieza de memoria más confiable.

## Criterios de aceptación
- La UI mantiene fluidez con múltiples pistas y clips.
- No aparecen inconsistencias de tiempo visibles.
- La memoria no crece sin control al navegar entre sesiones.

## Validación sugerida
- Profiling de React.
- Prueba manual con carga creciente de pistas/clips.
- Build de producción.