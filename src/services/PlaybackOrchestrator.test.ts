import { beforeEach, describe, expect, it } from 'vitest'
import { usePlayerStore } from '../store/usePlayerStore'
import { applyPlaybackEventToStore } from './PlaybackOrchestrator'

describe('PlaybackOrchestrator event translation', () => {
  beforeEach(() => {
    usePlayerStore.setState({
      transport: {
        ...usePlayerStore.getState().transport,
        mode: 'idle',
      },
    })
  })

  it('translates playback events into transport mode changes', () => {
    applyPlaybackEventToStore({ type: 'playback:started', timestamp: Date.now() })
    expect(usePlayerStore.getState().transport.mode).toBe('playing')

    applyPlaybackEventToStore({ type: 'playback:paused', timestamp: Date.now() })
    expect(usePlayerStore.getState().transport.mode).toBe('paused')
  })
})
