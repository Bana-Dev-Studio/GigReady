# phase4-tarea3 - Validación de release

## Estado
Completado y archivado.

## Requerimiento
Probar estados vacíos, parciales y de error para asegurar que el producto sigue siendo usable.

## Forma de encararlo
- Ejecutar flujos principales con fallas simuladas.
- Confirmar que la app no se bloquea ante errores.
- Verificar que los reintentos funcionan.

## Orientación mínima
- No asumir que el backend siempre responde bien.
- Probar casos límites antes de publicar.
- Mantener el flujo principal accesible.

## Criterios de aceptación
- La app sigue operable ante errores parciales.
- Los casos críticos tienen verificación previa.
- La release no depende de suposiciones ocultas.

## Resultado aplicado
- Se creó la suite `test:release` con validaciones de estados vacíos/parciales/error para contratos, validación de archivos y fallbacks.
- Se agregaron tests de contrato (`src/types/contracts.test.ts`) para payloads incompletos y errores críticos.
- Se agregaron tests de input (`src/utils/fileValidation.test.ts`) para casos límite de carga.
- Se documentó checklist operativo de release en `docs/release-validation-checklist.md`.