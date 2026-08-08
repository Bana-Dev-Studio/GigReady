# Phase 2 - Interacción musical útil

## Objetivo
Hacer que el reproductor se sienta como una herramienta real de trabajo, no solo como un visor con play/pause.

## Alcance

### Dentro de esta fase
- Selección, mute, trim y move de clips desde una experiencia clara.
- Timeline legible por compás, beat, secciones y loop regions.
- Persistencia de sesión y recuperación al recargar.
- Feedback no invasivo de fallos y recuperación.
- Atajos y navegación rápida.

### Fuera de esta fase
- Rediseño total del UI shell.
- Virtualización o canvas avanzada.
- Exportación de audio final.

## Pasos de ejecución

### Paso 1 - Dominio de interacción
- Confirmar qué acciones de clip son editables y cuáles son solo visuales.
- Definir selección activa, hover y estados de edición.
- Evitar lógica de interacción dentro de componentes visuales.

### Paso 2 - Timeline operativo
- Alinear la navegación por beats, compases, secciones y loops.
- Verificar que el timeline siempre use la misma fuente de verdad que el playback.
- Revisar el comportamiento al hacer seek desde UI.

### Paso 3 - Persistencia útil
- Guardar sesión, selección y contexto mínimo de navegación.
- Recuperar el estado sin confundir lo persistido con lo transitorio.
- Validar que un reload no destruya el trabajo del usuario.

### Paso 4 - Recuperación y feedback
- Unificar mensajes de carga, error y fallback.
- Evitar alertas intrusivas salvo errores fatales.
- Hacer visibles las acciones de retry y recuperación.

## Entregables
- Edición ligera de clips integrada al dominio.
- Timeline usable para navegación musical real.
- Persistencia y recuperación de sesión funcionando.
- Sistema de feedback consistente.

## Criterios de aceptación
- El usuario puede navegar y editar sin perder el contexto.
- Los clips se editan sin acoplar la UI a la lógica de dominio.
- La app sobrevive a reload y fallas parciales.

## Validación sugerida
- Tests de servicios de dominio.
- Tests de navegación timeline/playback.
- Build de producción.