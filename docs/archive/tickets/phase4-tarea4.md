# phase4-tarea4 - Documentación de integración

## Estado
Completado y archivado.

## Requerimiento
Dejar documentado cómo se conecta el frontend con la API externa para facilitar implementación y soporte.

## Forma de encararlo
- Describir requests, responses y estados.
- Explicar retry, polling y fallback si aplica.
- Separar claramente lo que consume frontend de lo que resuelve backend.

## Orientación mínima
- La documentación debe ser ejecutable por otro dev.
- Evitar ambigüedad de contrato.
- Mantener el texto alineado con el producto real.

## Criterios de aceptación
- Un desarrollador puede integrar sin preguntar el contexto básico.
- El contrato se entiende desde la documentación.
- La integración queda lista para mantenimiento.

## Resultado aplicado
- Se creó la guía operativa `docs/frontend-backend-integration.md` con endpoints, códigos esperados, polling, retry y fallback.
- Se dejó explícita la separación de responsabilidades frontend/backend.
- Se enlazó la guía desde `README.md` y `docs/api_spec.md` para navegación directa.