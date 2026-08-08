# phase2-tarea3 - Persistencia útil

## Requerimiento
Persistir sesión y recuperar el contexto mínimo sin confundir estado temporal con estado guardado.

## Forma de encararlo
- Definir qué guarda la sesión y qué no.
- Implementar recuperación clara al recargar.
- Validar que el estado persistido no sobrescriba el trabajo en curso.

## Orientación mínima
- Guardar solo lo necesario para retomar.
- Recuperar sin romper el flujo activo.
- Mantener la sesión como fuente de verdad.

## Criterios de aceptación
- Un reload no hace perder el contexto importante.
- La persistencia no interfiere con la edición.
- La sesión vuelve a un estado útil.