import { useCallback } from 'react'
import type { SoundTouchNode as SoundTouchNodeType } from '../types'

// Usamos RefObject o simplemente definimos la estructura que esperamos
export function usePitchEngine(soundTouchNode: { current: SoundTouchNodeType | null }) {
  const setPitch = useCallback((semitones: number) => {
    if (soundTouchNode.current) {
      // SoundTouch utiliza una propiedad pitchSemitones que es un AudioParam-like
      soundTouchNode.current.pitchSemitones.value = semitones
    }
  }, [soundTouchNode])

  return { setPitch }
}