# phase4-tarea1 - Contratos finales

## Estado
Completado y archivado.

## Requerimiento
Bloquear los contratos de datos que la UI necesita para no depender del mock.

## Forma de encararlo
- Revisar tipos y respuestas consumidas por frontend.
- Identificar campos obligatorios y opcionales.
- Documentar los supuestos que ya no deben cambiar.

## Orientación mínima
- El contrato debe ser explícito.
- No dejar ambigüedad sobre inputs y outputs.
- Evitar depender de implementación interna del backend.

## Criterios de aceptación
- Los tipos de frontend están claros.
- Los campos obligatorios están documentados.
- El contrato soporta fallback y evolución.

## Resultado aplicado
- Se definió contrato canónico en `src/types/contracts.ts` para análisis de beats y procesamiento de stems.
- Se agregaron normalizadores runtime para bloquear forma de payload y defaults de fallback.
- `mockApi` y `stemApi` pasaron a usar el contrato canónico normalizado.
- Se documentaron campos obligatorios/opcionales y reglas de fallback en `docs/frontend-data-contracts.md`.