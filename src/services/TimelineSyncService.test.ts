import { describe, expect, it } from 'vitest'
import { timelineSyncService } from './TimelineSyncService'

describe('TimelineSyncService', () => {
  it('computes the current beat, measure and next beat time from playback time', () => {
    const snapshot = timelineSyncService.getClockSnapshot({
      playbackTimeSeconds: 2,
      bpm: 120,
      timeSignature: [4, 4],
    })

    expect(snapshot.beat).toBe(5)
    expect(snapshot.measure).toBe(2)
    expect(snapshot.beatInMeasure).toBe(1)
    expect(snapshot.nextBeatTimeSeconds).toBe(2.5)
  })
})
