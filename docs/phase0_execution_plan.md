# Fase 0 - Plan de ejecución de arquitectura y escalabilidad

Este documento acompaña el roadmap y transforma la Fase 0 del roadmap en un plan ejecutable para trabajar en conjunto.

> Esta no es una iniciativa independiente: es la capa operativa de la Fase 0 del roadmap, dedicada a consolidar el cimiento arquitectónico del producto.

## Objetivo general

Estabilizar el core del producto para que el sistema pueda:
- cargar y reproducir audio de forma fiable,
- navegar por tiempo, beats y compases,
- manejar grabaciones y anotaciones sin romper el motor,
- escalar sin introducir fragilidad en la experiencia.

---

## Épica 1 - Modelo de dominio del proyecto

### Objetivo
Establecer una representación formal del proyecto y del estado de reproducción.

### Tareas
- [x] Definir tipos principales para proyecto, sesión, timeline, tracks, clips y markers.
- [x] Crear un estado central del proyecto que no dependa de React para representar el contexto de uso.
- [x] Definir el contrato mínimo para playhead, loop, offset, metronomo y sincronización.
- [x] Documentar cómo se relacionan los distintos elementos del mix entre sí.

### Criterios de aceptación
- Existe un modelo claro del dominio del producto.
- El estado del proyecto puede representarse sin depender directamente de componentes UI.
- El modelo permite evolucionar hacia compases, loops, clips y anotaciones.

---

## Épica 2 - Transporte y sincronización centralizada

### Objetivo
Separar la lógica de reproducción del UI para que exista una única fuente de verdad.

### Tareas
- [x] Diseñar un servicio o store central para transporte y playback.
- [x] Mover la lógica de play/pause/seek/loop al motor central.
- [x] Garantizar que el timeline y el player consuman el mismo estado.
- [x] Definir cómo se resuelven los offsets y los puntos de inicio de reproducción.

### Criterios de aceptación
- Play, pause, seek y loop funcionan desde una única fuente de verdad.
- No hay divergencia entre UI y engine en el tiempo de reproducción.
- El hook de transporte queda como adaptador, no como motor principal.

---

## Épica 3 - Motor de audio como capa responsable

### Objetivo
Convertir el motor de audio en una capa estable, limpia y reutilizable.

### Tareas
- [x] Revisar y consolidar la responsabilidad de AudioService.
- [x] Centralizar la creación y destrucción de sources.
- [x] Encapsular la sincronización de pistas y el control de gain/mute.
- [x] Definir un flujo de inicialización, resume y cleanup seguro.
- [x] Evitar que la lógica de audio quede dispersa en hooks o componentes.

### Criterios de aceptación
- El motor de audio puede manejar varias pistas sin depender de la UI.
- La inicialización y limpieza del contexto son predictivas.
- Se evita la duplicación de lógica de reproducción y sincronización.

---

## Épica 4 - Gestión de assets de audio

### Objetivo
Controlar carga, decodificación, cache y limpieza de memoria.

### Tareas
- [x] Crear un gestor de assets con cache por URL.
- [x] Definir estados de carga: idle, loading, ready, error, disposed.
- [x] Evitar decodificaciones repetidas del mismo archivo.
- [x] Implementar limpieza automática al cambiar de canción o proyecto.
- [x] Asegurar que las pistas grabadas se puedan cargar y liberar sin fugas.

### Criterios de aceptación
- Los buffers se reutilizan cuando corresponde.
- No hay decodificaciones innecesarias.
- El cambio de proyecto no deja memoria acumulada ni recursos vivos.

---

## Épica 5 - Timeline musical y backend contract

### Objetivo
Preparar el sistema para poder navegar por beats, compases, secciones y loops.

### Tareas
- [x] Definir la estructura de markers, beats, compases y secciones.
- [x] Diseñar el contrato de datos que recibirá el frontend desde backend.
- [x] Implementar la lógica de traducción entre segundos y unidades musicales.
- [x] Preparar el sistema para recibir timing data sin depender del mock actual.

### Criterios de aceptación
- El frontend puede interpretar timing musical de forma consistente.
- El flujo de navegación por compás y secciones está preparado para backend.
- La UI no necesita conocer los detalles internos del cálculo.

---

## Épica 6 - Grabaciones y anotaciones como clips

### Objetivo
Modelar las grabaciones como objetos de dominio reutilizables.

### Tareas
- [x] Definir el tipo de clip de grabación con tiempo, duración, offset y estado.
- [x] Separar captura de audio de renderización y reproducción.
- [x] Preparar la estructura para edición ligera futura: trim, move, mute.
- [x] Integrar los clips al estado del proyecto sin romper la experiencia actual.

### Criterios de aceptación
- Las grabaciones se gestionan como clips del proyecto.
- El sistema puede posicionarlas y controlarlas sin lógica dispersa.
- El modelo está preparado para futuras mejoras de edición.

---

## Épica 7 - Observabilidad, errores y hardening

### Objetivo
Que el sistema sea debuggable y resistente ante fallas de carga o sincronización.

### Tareas
- [x] Definir estados de error y carga por recurso.
- [x] Registrar eventos de carga, decode, playback y cleanup.
- [x] Implementar mensajes de error claros para el usuario.
- [x] Preparar fallbacks cuando un recurso no se pueda cargar o sincronizar.

### Criterios de aceptación
- El sistema permite identificar rápidamente la causa de un fallo.
- El usuario recibe feedback útil si algo falla.
- No hay comportamientos silenciosos ni estados ambiguos.

---

## Orden recomendado de implementación

1. Modelo de dominio del proyecto.
2. Transporte y sincronización centralizada.
3. Motor de audio como capa responsable.
4. Gestión de assets de audio.
5. Timeline musical y contrato backend.
6. Grabaciones y anotaciones como clips.
7. Observabilidad y hardening.

---

## Recomendación de trabajo en conjunto

Para avanzar bien, conviene trabajar por entregables pequeños y verificables:
- una épica por iteración,
- una o dos tareas principales por sesión,
- validación del comportamiento real tras cada cambio,
- sin introducir cambios de UX que no sean estrictamente necesarios.

---

## Definition of Done global de la Fase 0

La Fase 0 se considera completa cuando:
- el sistema tiene una arquitectura de dominio clara,
- el transporte está centralizado y estable,
- el motor de audio ya no depende de la UI para su funcionamiento,
- la gestión de recursos de audio es controlada y segura,
- el proyecto está preparado para recibir beats, compases, loops y grabaciones como entidades del sistema.

## Regresión asociada
La regresión de esta fase quedó documentada en [docs/phase0_regression.md](docs/phase0_regression.md).
