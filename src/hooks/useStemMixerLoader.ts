import { useEffect, useState } from 'react'
import { audioAssetManager } from '../services/AudioAssetManager'
import type { Stem } from '../utils/stemApi'

type StemTrackInput = Pick<Stem, 'id' | 'label' | 'mimeType' | 'durationMs'> & {
  audioUrl?: string
  enabled?: boolean
  gain?: number
}

export interface LoadedStemTrack {
  id: string
  label: string
  audioUrl?: string
  buffer: AudioBuffer | null
  enabled: boolean
  gain: number
}

export function useStemMixerLoader(stems?: StemTrackInput[]) {
  const [loadedStems, setLoadedStems] = useState<LoadedStemTrack[]>([])

  useEffect(() => {
    if (!stems || stems.length === 0) {
      setLoadedStems([])
      return
    }

    const seenIds = new Set<string>()
    const seenUrls = new Set<string>()
    const uniqueStems = stems.filter((stem) => {
      const normalizedId = stem.id.trim()
      const normalizedUrl = (stem.audioUrl ?? '').trim()
      if (seenIds.has(normalizedId)) return false
      if (normalizedUrl.length > 0 && seenUrls.has(normalizedUrl)) return false
      seenIds.add(normalizedId)
      if (normalizedUrl.length > 0) {
        seenUrls.add(normalizedUrl)
      }
      return true
    })

    let isActive = true

    const loadStems = async () => {
      const results = await Promise.all(
        uniqueStems.map(async (stem) => {
          if (!stem.audioUrl) {
            return {
              id: stem.id,
              label: stem.label,
              audioUrl: stem.audioUrl,
              buffer: null,
              enabled: stem.enabled ?? true,
              gain: stem.gain ?? 1,
            } as LoadedStemTrack
          }

          try {
            const buffer = await audioAssetManager.load(stem.audioUrl)
            return {
              id: stem.id,
              label: stem.label,
              audioUrl: stem.audioUrl,
              buffer,
              enabled: stem.enabled ?? true,
              gain: stem.gain ?? 1,
            } as LoadedStemTrack
          } catch (error) {
            console.error(`[useStemMixerLoader] Error cargando stem ${stem.id}:`, error)
            return {
              id: stem.id,
              label: stem.label,
              audioUrl: stem.audioUrl,
              buffer: null,
              enabled: stem.enabled ?? true,
              gain: stem.gain ?? 1,
            } as LoadedStemTrack
          }
        }),
      )

      if (isActive) {
        setLoadedStems(results)
      }
    }

    void loadStems()

    return () => {
      isActive = false
    }
  }, [stems])

  return {
    loadedStems,
  }
}
