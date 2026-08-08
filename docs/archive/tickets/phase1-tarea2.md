# phase1-tarea2 - Carga y selección

## Estado
Completado y archivado.

## Requerimiento
Construir el flujo de upload y selección de stems para que la pista principal quede clara desde el primer uso.

## Forma de encararlo
- Diseñar el recorrido desde archivo hasta pista disponible.
- Presentar los stems como opciones seleccionables.
- Preservar la sesión cuando se cambia el stem principal.

## Orientación mínima
- No asumir un único stem.
- Mantener el resultado del procesamiento visible y navegable.
- Evitar que la selección reemplace todo el contexto.

## Criterios de aceptación
- El usuario puede cargar un archivo y entender el resultado.
- Puede elegir una pista principal sin perder la sesión.
- La interfaz refleja correctamente qué stem está activo.

## Resultado aplicado
- Se agregó un selector de stems visible en [src/App.tsx](../../src/App.tsx).
- La selección de stem activo se persiste en el proyecto como metadata.