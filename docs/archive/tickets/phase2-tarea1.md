# phase2-tarea1 - Dominio de interacción

## Estado
Completado y archivado.

## Requerimiento
Definir selección, hover y edición de clips sin mezclar lógica de dominio con componentes visuales.

## Forma de encararlo
- Revisar qué acciones de clip son reales y cuáles son solo visuales.
- Formalizar estados de interacción en el dominio.
- Hacer que la UI solo represente decisiones ya tomadas.

## Orientación mínima
- El clip seleccionado debe existir como estado explícito.
- Hover y drag no deben depender de lógica improvisada en pantalla.
- Las operaciones de edición deben ser predecibles.

## Criterios de aceptación
- La edición ligera se entiende y se ejecuta desde el dominio.
- La UI no contiene reglas de negocio de clip.
- El usuario puede seleccionar y deseleccionar sin inconsistencias.

## Resultado aplicado
- Se agregó estado explícito de hover al dominio de clips.
- La UI de grabaciones refleja hover y selección como estados distintos.
- El dominio permite limpiar hover sin depender de reglas improvisadas en el componente.