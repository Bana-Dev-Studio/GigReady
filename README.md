# GigReady Prototype

Prototipo visual de una aplicación de ensayo musical para bandas y equipos de worship.

## Características

- Interfaz en modo oscuro inspirada en DAWs y plataformas musicales.
- Sidebar con lista de canciones mockeadas y estados de procesamiento.
- Carga de audio local usando `URL.createObjectURL`.
- Visualizador de onda con `wavesurfer.js`.
- Panel de ensayo con control de pitch visual, BPM detectado y click track simulado.

## Instalación

Desde la raíz del proyecto:

```bash
npm install
```

## Ejecución

```bash
npm run dev
```

## Deploy en GitHub Pages

Este proyecto ya queda preparado para publicar `dist/` en una rama `gh-pages`.

1. Instalar dependencias:

```bash
npm install
```

2. Construir y publicar:

```bash
npm run deploy
```

3. En GitHub, ir a Settings > Pages y seleccionar:

- Source: Deploy from a branch
- Branch: gh-pages
- Folder: / (root)

4. Para que Vite sirva correctamente bajo tu subruta de repo, publicar usando:

```bash
VITE_BASE_PATH=/NOMBRE_REPO/ npm run deploy
```

En PowerShell de Windows:

```powershell
$env:VITE_BASE_PATH='/NOMBRE_REPO/'; npm run deploy
```

## Mock de stems con archivos reales

Podés simular que el backend devuelve stems reales copiándolos a `public/api/mock-stems` y generando un catálogo JSON consumido por la app.

1. Importar stems desde una carpeta local:

```bash
npm run import:stems -- "C:\\Users\\tmankowski\\Downloads\\Multitrack Venció - Marcos Witt\\Multitrack Venció - Marcos Witt"
```

2. El script:

- copia los audios compatibles (`.wav`, `.mp3`, `.flac`, `.m4a`, `.ogg`, `.aac`, `.aif`, `.aiff`) a `public/api/mock-stems/<song-id>/`
- genera o actualiza `public/api/mock-stem-catalog.json` con el contrato esperado por frontend

3. En la UI, al subir cualquier archivo de audio, el mock intenta matchear por nombre y, si no encuentra match, devuelve una canción del catálogo al azar.

Notas:

- `durationMs` se deja en `0` en el catálogo; la app calcula duración real leyendo metadata del audio.
- Si no existe catálogo o no tiene stems válidos, el flujo hace fallback al comportamiento anterior (usar el archivo subido como stem único).
- El mock se puede apagar sin tocar código. Opción rápida en el navegador:
  - `window.trackRehearsal.setStemMockEnabled(false)`
  - `window.trackRehearsal.setStemMockEnabled(true)`
- O también por variable de entorno en desarrollo: `VITE_ENABLE_STEM_MOCK=false`.

## Estructura relevante

- `src/App.tsx` — Layout principal y estado de la aplicación.
- `src/components/Sidebar.tsx` — Lista de canciones y botón de carga.
- `src/components/Waveform.tsx` — Visualizador de forma de onda con controles básicos.
- `src/components/RehearsalMonitor.tsx` — Mock de panel de ensayo, BPM y click track.
- `docs/execution-plans/README.md` — Planes de ejecución por fase para frontend y backend externo.
- `docs/frontend-data-contracts.md` — Contratos de datos frontend (campos obligatorios/opcionales + fallback).
- `docs/release-validation-checklist.md` — Checklist de estados críticos para validación de release.
- `docs/frontend-backend-integration.md` — Guía ejecutable de integración frontend con API externa.

## Notas

- El upload es mockeado y usa archivos locales del navegador.
- Los controles son visuales; no hay procesamiento de audio real.
