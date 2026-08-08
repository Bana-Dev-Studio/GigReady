# phase1-tarea1 - Estado de entrada

## Estado
Completado y archivado.

## Requerimiento
Definir y mostrar correctamente los estados básicos de una sesión: vacía, con pista cargada y con error.

## Forma de encararlo
- Identificar qué componentes muestran el estado inicial.
- Reducir la lógica condicional dispersa en UI.
- Centralizar el copy y los estados visuales principales.

## Orientación mínima
- Usar la sesión actual como fuente de verdad.
- Mantener un estado vacío claro.
- Mostrar el error sin bloquear el resto de la app.

## Criterios de aceptación
- La app comunica claramente qué hacer al abrirse sin contenido.
- El usuario distingue entre cargando, listo y error.
- No quedan pantallas ambiguas o sin salida.

## Resultado aplicado
- Se reforzó el estado vacío en la biblioteca de canciones en [src/components/Sidebar.tsx](../../src/components/Sidebar.tsx).