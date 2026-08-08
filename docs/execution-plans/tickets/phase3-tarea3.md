# phase3-tarea3 - Minimizar re-renders

## Requerimiento
Reducir re-renders innecesarios y particionar estado por responsabilidad.

## Forma de encararlo
- Revisar qué estados disparan más renders.
- Separar estados que no necesitan convivir.
- Usar selectores solo donde aporten claridad y ahorro real.

## Orientación mínima
- El estado local no debe dominar toda la pantalla.
- Las actualizaciones frecuentes deben ser baratas.
- Evitar recalculos de UI pesada.

## Criterios de aceptación
- Menos renders por interacción.
- Menos ruido de estado en componentes grandes.
- La UI se siente más estable.