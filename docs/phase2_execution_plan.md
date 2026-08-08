# Phase 2 - Plan de ejecución para escalabilidad, rendimiento y preparación de producto

## Objetivo
Tomar la base consolidada de la Phase 1 y prepararla para crecer sin perder estabilidad: más pistas, más clips, más sesiones y mejor rendimiento de carga y reproducción.

## Principios
- Mantener la experiencia actual intacta.
- Reducir acoplamiento entre UI, motor de audio y estado de dominio.
- Mejorar rendimiento sin introducir complejidad innecesaria.
- Verificar cada batch con pruebas y build.

## Batch 1 - Orquestación de estado y eventos
### Tareas
- [x] Separar claramente los eventos de playback, loading, error y timeline en un orquestador central.
- [x] Reducir dependencias directas entre componentes React y servicios de audio.
- [x] Definir un contrato de eventos reutilizable para UI y motor.

### Criterios de aceptación
- [x] La UI reacciona a eventos de dominio desde un único flujo.
- [x] El motor y la UI no comparten lógica de control dispersa.

## Batch 2 - Rendimiento de carga y reproducción
### Tareas
- [x] Optimizar la reutilización de buffers y evitar recreaciones innecesarias.
- [x] Introducir métricas internas de carga, decode y playback para detectar cuellos de botella.
- [x] Preparar el pipeline para múltiples clips y pistas sin degradar el rendimiento.

### Criterios de aceptación
- [x] El sistema mantiene rendimiento aceptable al crecer el número de recursos.
- [x] Los puntos críticos de carga y reproducción quedan observables.

## Batch 3 - Expansión de dominio y escalabilidad
### Tareas
- [x] Ampliar el modelo de proyecto para soportar sesiones, múltiples pistas y estados de edición más complejos.
- [x] Encapsular reglas de negocio del timeline y clip editing en servicios del dominio.
- [x] Reducir la probabilidad de regressions al introducir nuevas entidades.

### Criterios de aceptación
- [x] El modelo de dominio soporta crecimiento sin reescribir la arquitectura existente.
- [x] Los nuevos flujos se pueden implementar sobre una base estable.

## Batch 4 - Preparación para producto y hardening avanzado
### Tareas
- [x] Definir estados de sesión, carga y recuperación para un producto más robusto.
- [x] Preparar una capa de fallback para recursos parcialmente disponibles.
- [x] Documentar los puntos críticos para futuras extensiones.

### Criterios de aceptación
- [x] La app está preparada para evolucionar sin romper experiencia ni arquitectura.
- [x] Los riesgos operativos se reducen de forma progresiva.

## Definition of Done
La Phase 2 se considera lista cuando:
- la app tiene un flujo de eventos más limpio y escalable,
- el rendimiento de carga y playback se puede medir y mejorar,
- el modelo de dominio soporta crecimiento sin complejidad accidental.

## Regresión asociada
La regresión específica de esta ejecución quedó documentada en [docs/phase2_regression.md](docs/phase2_regression.md).
