# phase3-tarea3 - Minimizar re-renders

## Estado
Completado y archivado.

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

## Resultado aplicado
- Se memoizaron componentes visuales de alta frecuencia para cortar renders por cascada desde el contenedor principal.
- En `Waveform` se consolidó la suscripción a Zustand con `useShallow` para evitar renders por cambios irrelevantes fuera del selector.
- La carga y reproducción mantienen el comportamiento funcional, validado con build de producción.