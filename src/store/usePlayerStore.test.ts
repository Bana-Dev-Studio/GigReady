import { beforeEach, describe, expect, it } from 'vitest'
import { usePlayerStore } from './usePlayerStore'

describe('usePlayerStore transport state', () => {
  beforeEach(() => {
    usePlayerStore.setState({
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      isReady: false,
      loadProgress: 0,
      transport: {
        mode: 'idle',
        playheadSeconds: 0,
        durationSeconds: 0,
        isReady: false,
        offsetSeconds: 0,
      },
    })
  })

  it('updates transport mode and playhead through dedicated actions', () => {
    const store = usePlayerStore.getState()

    store.setPlaybackMode('playing')
    store.setPlayhead(12.5)

    const nextState = usePlayerStore.getState()
    expect(nextState.transport.mode).toBe('playing')
    expect(nextState.transport.playheadSeconds).toBe(12.5)
    expect(nextState.currentTime).toBe(12.5)
  })

  it('persists transport offset configuration', () => {
    const store = usePlayerStore.getState()

    store.setOffset(3.5)

    const nextState = usePlayerStore.getState()
    expect(nextState.transport.offsetSeconds).toBe(3.5)
  })
})
