# Release Validation Checklist

Checklist de verificación previa a publicación para estados vacíos, parciales y de error.

## Objetivo

Confirmar que la app sigue operable ante fallos y que los casos críticos tienen validación explícita.

## 1) Estados vacíos

- `sin canciones cargadas`: la app muestra estado vacío en sidebar y CTA de carga.
- `sin markers`: timeline no rompe y muestra estado vacío usable.
- `sin stems disponibles`: se muestra fallback de espera/procesamiento sin bloquear la sesión.

Resultado esperado:

- La navegación sigue disponible.
- No hay crashes por arrays vacíos.

## 2) Estados parciales

- `beat analysis parcial`: payload sin campos opcionales (`bpm`, `clickTrackUrl`, `bpmSegments`) mantiene flujo funcional.
- `stem processing parcial`: stems con defaults válidos (mime/duration) se normalizan sin romper UI.
- `loading parcial`: app publica señales de loading start/completed y mantiene controles disponibles cuando corresponde.

Resultado esperado:

- Los fallbacks de contrato mantienen render consistente.
- No hay dependencia dura de campos opcionales.

## 3) Estados de error

- `archivo inválido`: validación de input rechaza tipo/tamaño/extensión con notice de recuperación.
- `procesamiento fallido`: se registra error con scope `audio-load` y señal de fallback.
- `playback fallido`: se registra error con scope `audio-playback` y recovery action de reintento.

Resultado esperado:

- El usuario puede reintentar.
- El flujo principal no queda bloqueado.
- Queda evidencia en métricas/eventos.

## 4) Verificación automatizada mínima

Ejecutar:

```bash
npm run test:release
npm run build
```

Cobertura del comando `test:release`:

- Contratos normalizados (vacío/parcial/error)
- Validación de archivos de entrada
- Notices de fallback y telemetría
- Registro base de errores