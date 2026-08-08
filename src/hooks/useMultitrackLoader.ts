import { useState, useEffect, useRef } from 'react'
import { audioService } from '../services/AudioService'

interface TrackInput {
  id: string
  url: string
  offset: number
  gain?: number
  enabled?: boolean
}

interface LoadedTrack {
  id: string
  buffer: AudioBuffer
  offset: number
  gain: number
  enabled: boolean
}

interface MultiTrackLoaderResult {
  recordedBuffers: LoadedTrack[]
  isLoading: boolean
  error: string | null
}

export function useMultiTrackLoader(recordedTracks?: TrackInput[]): MultiTrackLoaderResult {
  const [recordedBuffers, setRecordedBuffers] = useState<LoadedTrack[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Guardamos un array de AbortControllers activos para poder frenar las descargas en paralelo
  const abortControllersRef = useRef<AbortController[]>([])

  useEffect(() => {
    // 🧹 Cleanup inmediato: Si cambian las pistas, cancelamos CUALQUIER descarga activa de raíz
    if (abortControllersRef.current.length > 0) {
      console.debug(`[useMultiTrackLoader] Cancelando ${abortControllersRef.current.length} descargas multipista anteriores...`)
      abortControllersRef.current.forEach(controller => controller.abort())
      abortControllersRef.current = []
    }

    if (!recordedTracks || recordedTracks.length === 0) {
      setRecordedBuffers([])
      setIsLoading(false)
      setError(null)
      return
    }

    const decodeAllTracks = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const ctx = await audioService.init()
        const loadedTracks: LoadedTrack[] = []
        const currentControllers: AbortController[] = []

        // Creamos un plan de promesas en paralelo para no ralentizar la carga
        const downloadPromises = recordedTracks.map(async (track) => {
          const controller = new AbortController()
          currentControllers.push(controller)

          try {
            // Fetch blindado con el token de cancelación
            const res = await fetch(track.url, { signal: controller.signal })
            if (!res.ok) throw new Error(`Failed to fetch stem ${track.id}`)
            
            const arrayBuffer = await res.arrayBuffer()
            
            // Verificación intermedia antes del proceso costoso de CPU
            if (controller.signal.aborted) return

            const buffer = await ctx.decodeAudioData(arrayBuffer)
            
            // Verificación final post-decodificación
            if (controller.signal.aborted) return

            loadedTracks.push({
              id: track.id,
              buffer,
              offset: track.offset,
              gain: track.gain ?? 1,
              enabled: track.enabled ?? true
            })
          } catch (err: any) {
            if (err.name === 'AbortError') {
              console.debug(`[useMultiTrackLoader] Descarga de pista ${track.id} abortada correctamente.`)
              return
            }
            // Si falla una pista secundaria, lo registramos pero dejamos que las demás intenten cargar
            console.error(`[useMultiTrackLoader] Error cargando pista grabada ${track.id}:`, err)
          }
        })

        // Guardamos las referencias globales para poder abortar desde el exterior del flujo si hace falta
        abortControllersRef.current = currentControllers

        // Esperamos que terminen todas las descargas paralelas
        await Promise.all(downloadPromises)

        // Si el efecto entero no se desmontó en el camino, guardamos los buffers en el estado
        setRecordedBuffers(loadedTracks)
        setIsLoading(false)
        console.debug(`[useMultiTrackLoader] Multipista procesado. ${loadedTracks.length} canales listos para el mixer.`)

      } catch (err: any) {
        console.error('[useMultiTrackLoader] Error crítico en el cargador multipista:', err)
        setError('Error general al procesar los canales de audio secundarios.')
        setIsLoading(false)
      }
    }

    void decodeAllTracks()

    // Si el músico cambia de canción o abandona el panel de ensayo, ¡ZAP! Se mueren todos los hilos de red en paralelo
    return () => {
      abortControllersRef.current.forEach(controller => controller.abort())
    }
  }, [recordedTracks])

  return {
    recordedBuffers,
    isLoading,
    error
  }
}