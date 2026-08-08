/**
 * Hook para procesar archivos de audio y obtener stems
 */
import { useState, useCallback } from 'react'
import { uploadAndProcessAudio, type StemProcessingResponse, type Stem } from '../utils/stemApi'

type StemProcessingState = {
  isProcessing: boolean
  error: string | null
  stems: Stem[] | null
  processingResponse: StemProcessingResponse | null
}

export function useStemProcessing() {
  const [state, setState] = useState<StemProcessingState>({
    isProcessing: false,
    error: null,
    stems: null,
    processingResponse: null,
  })

  const processAudioFile = useCallback(async (file: File): Promise<StemProcessingResponse | null> => {
    setState({
      isProcessing: true,
      error: null,
      stems: null,
      processingResponse: null,
    })

    try {
      const response = await uploadAndProcessAudio({ file })

      // Calcular duración real de cada stem cargando metadata
      const stemsWithDuration = await Promise.all(
        response.stems.map(async (stem) => {
          const duration = await getAudioDuration(stem.audioUrl)
          return { ...stem, durationMs: duration * 1000 }
        }),
      )

      const updatedResponse = { ...response, stems: stemsWithDuration }

      setState({
        isProcessing: false,
        error: null,
        stems: stemsWithDuration,
        processingResponse: updatedResponse,
      })

      return updatedResponse
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al procesar audio'
      setState({
        isProcessing: false,
        error: errorMessage,
        stems: null,
        processingResponse: null,
      })
      return null
    }
  }, [])

  return {
    ...state,
    processAudioFile,
    reset: () => {
      setState({
        isProcessing: false,
        error: null,
        stems: null,
        processingResponse: null,
      })
    },
  }
}

/**
 * Utilidad: obtener duración de un audio desde un URL blob/data
 */
function getAudioDuration(audioUrl: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio()
    audio.src = audioUrl

    const onLoadedMetadata = () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('error', onError)
      const duration = isFinite(audio.duration) ? audio.duration : 0
      resolve(duration)
    }

    const onError = () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('error', onError)
      reject(new Error('Error loading audio metadata'))
    }

    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('error', onError)
  })
}
