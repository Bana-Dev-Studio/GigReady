import { useState, useEffect, useRef } from 'react'
import { audioAssetManager } from '../services/AudioAssetManager'

interface TrackLoaderResult {
  audioBuffer: AudioBuffer | null
  isLoading: boolean
  error: string | null
  progress: number
  delayedLoading: boolean
}

export function useTrackLoader(fileUrl: string | null): TrackLoaderResult {
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<number>(0)

  // Mantenemos una referencia al abort controller para poder cancelar desde los efectos
  const abortControllerRef = useRef<AbortController | null>(null)
const [delayedLoading, setDelayedLoading] = useState(false); // Carga para la UI

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (isLoading) {
      // Si empieza a cargar, mostramos el spinner INMEDIATAMENTE
      setDelayedLoading(true);
    } else {
      // Si termina, esperamos 500ms para ocultar el spinner
      timer = setTimeout(() => setDelayedLoading(false), 500);
    }

    return () => clearTimeout(timer);
  }, [isLoading]);

  useEffect(() => {
    // Si la URL cambia o pasa a ser null, cancelamos cualquier operación activa
    if (abortControllerRef.current) {
      console.debug('[useTrackLoader] Cancelando descarga anterior debido a cambio de URL.')
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }

    // Limpiamos los estados si no hay archivo que cargar
    if (!fileUrl) {
      setAudioBuffer(null)
      setIsLoading(false)
      setError(null)
      setProgress(0)
      return
    }

    const loadAndDecodeTrack = async () => {
      setIsLoading(true)
      setError(null)
      setProgress(0)
      setAudioBuffer(null)

      // 🚀 Inicializamos el AbortController para esta descarga específica
      const controller = new AbortController()
      abortControllerRef.current = controller

      try {
        const cachedBuffer = await audioAssetManager.load(fileUrl)
        if (controller.signal.aborted || !cachedBuffer) {
          return
        }

        setAudioBuffer(cachedBuffer)
        setProgress(100)
        setIsLoading(false)
        console.debug('[useTrackLoader] Buffer reutilizado o decodificado por AudioAssetManager.')

      } catch (err: any) {
        // Si el error fue provocado adrede por nuestro .abort(), no actualizamos estado de error
        if (err.name === 'AbortError') {
          console.debug('[useTrackLoader] Descarga abortada con éxito de forma controlada.')
          return
        }

        console.error('[useTrackLoader] Error crítico durante la carga/decodificación:', err)
        setError(err.message || 'Error desconocido al procesar el archivo de audio.')
        setIsLoading(false)
        setProgress(0)
      }
    }

    void loadAndDecodeTrack()

    // Cleanup function: Si el componente se desmonta mientras descarga, ¡ZAP! Se aborta inmediatamente
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      void audioAssetManager.dispose(fileUrl)
    }
  }, [fileUrl])

  return {
    audioBuffer,
    isLoading,
    error,
    progress,
    delayedLoading
  }
}