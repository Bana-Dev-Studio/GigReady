import { useEffect } from 'react'
import { playbackEventBus, type PlaybackEvent, type PlaybackEventType } from './PlaybackEventBus'
import { usePlayerStore } from '../store/usePlayerStore'
import type { PlaybackMode } from '../types'

const loadingMode = 'idle' as PlaybackMode

export function resolvePlaybackMode(eventType: PlaybackEventType): PlaybackMode | null {
  switch (eventType) {
    case 'playback:started':
      return 'playing'
    case 'playback:paused':
    case 'playback:error':
    case 'loading:error':
      return 'paused'
    case 'loading:started':
      return loadingMode
    case 'loading:completed':
      return 'idle'
    default:
      return null
  }
}

export function applyPlaybackEventToStore(event: PlaybackEvent): void {
  const mode = resolvePlaybackMode(event.type)
  if (mode) {
    usePlayerStore.getState().setPlaybackMode(mode)
  }
}

export function usePlaybackOrchestrator() {
  useEffect(() => {
    const unsubscribe = playbackEventBus.subscribe((event: PlaybackEvent) => {
      applyPlaybackEventToStore(event)
    })

    return unsubscribe
  }, [])
}
