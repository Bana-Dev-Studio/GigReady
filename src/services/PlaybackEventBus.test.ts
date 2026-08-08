import { describe, expect, it } from 'vitest'
import { playbackEventBus } from './PlaybackEventBus'

describe('PlaybackEventBus', () => {
  it('publishes and receives events through the shared bus', () => {
    const received: string[] = []
    const unsubscribe = playbackEventBus.subscribe((event) => {
      received.push(event.type)
    })

    playbackEventBus.publish({ type: 'playback:started', timestamp: Date.now() })

    unsubscribe()

    expect(received).toContain('playback:started')
  })
})
