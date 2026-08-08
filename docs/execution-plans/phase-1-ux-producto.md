# Phase 1 - UX de producto

## Objetivo
Convertir la base técnica actual en una experiencia clara de carga, selección y reproducción de pistas para que el valor del producto se entienda en segundos.

## Alcance

### Dentro de esta fase
- Flujo de carga de archivo y preparación de pista.
- Selector visual de stems y estados por recurso.
- Empty states, loading states y error states consistentes.
- Jerarquía visual más fuerte para sesión, pista activa y acciones primarias.
- Responsive layout y accesibilidad básica.

### Fuera de esta fase
- Reescritura del motor de audio.
- Implementación del backend de stems.
- Edición avanzada de clips.
- Optimización extrema de performance.

## Pasos de ejecución

### Paso 1 - Estado de entrada
- Definir el estado mínimo para una sesión vacía, una sesión con pista cargada y una sesión con error.
- Revisar el copy de carga, error y estado vacío.
- Confirmar qué acciones primarias deben estar siempre visibles.

### Paso 2 - Carga y selección
- Diseñar el flujo visual de upload.
- Mostrar el resultado del procesamiento como una lista o tarjeta de stems.
- Permitir seleccionar stem principal sin perder contexto de la sesión.

### Paso 3 - Jerarquía visual
- Ordenar el layout para que la pista activa sea el foco.
- Reducir ruido visual en controles secundarios.
- Asegurar contraste, tamaños y accesibilidad de navegación por teclado.

### Paso 4 - Estados resilientes
- Mostrar loading, partial y error sin bloquear el resto de la app.
- Mantener acciones de reintento y recuperación visibles.
- Validar que el usuario siempre pueda volver a un estado operativo.

## Entregables
- Flujo de carga claro y usable.
- Selector de stems visible y entendible.
- Estados vacíos y de error con feedback útil.
- Layout responsive con jerarquía definida.

## Criterios de aceptación
- Un usuario nuevo entiende qué hacer en menos de 30 segundos.
- La selección de pista principal no rompe la sesión.
- Los errores no dejan la app en un estado bloqueado.

## Validación sugerida
- Revisión visual manual en desktop y mobile.
- Tests de render para estados vacíos, loading y error.
- Build de producción.