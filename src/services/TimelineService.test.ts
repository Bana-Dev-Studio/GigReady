import { describe, expect, it } from 'vitest'
import { buildTimelineContract, getActiveMarker, getBeatPosition, getSectionForTime, secondsToBeats, beatsToSeconds } from './TimelineService.ts'

describe('TimelineService', () => {
  it('translates seconds into beat, measure and beat-in-measure positions', () => {
    const position = getBeatPosition(3, 120, [4, 4])

    expect(position.beat).toBe(4)
    expect(position.measure).toBe(1)
    expect(position.beatInMeasure).toBe(4)
  })

  it('normalizes backend timeline data into a reusable contract', () => {
    const contract = buildTimelineContract({
      bpm: 120,
      timeSignature: [4, 4],
      durationSeconds: 8,
      sections: [
        { id: 'verse', label: 'Verse', startTimeSeconds: 0, endTimeSeconds: 4 },
      ],
      beats: [
        { timeSeconds: 0, beat: 1, measure: 1, beatInMeasure: 1, label: '1' },
        { timeSeconds: 4, beat: 5, measure: 2, beatInMeasure: 1, label: '5' },
      ],
    })

    expect(contract.bpm).toBe(120)
    expect(contract.sections).toHaveLength(1)
    expect(contract.markers).toHaveLength(3)
    expect(contract.markers[0].type).toBe('beat')
  })

  it('converts between seconds and beats consistently', () => {
    const beats = secondsToBeats(2, 120)
    const seconds = beatsToSeconds(4, 120)

    expect(beats).toBe(4)
    expect(seconds).toBe(2)
  })

  it('selects the last marker that is still behind the current playback time', () => {
    const markers = [
      { id: 'beat-1', type: 'beat' as const, timeSeconds: 0, label: '1' },
      { id: 'beat-2', type: 'beat' as const, timeSeconds: 1, label: '2' },
      { id: 'beat-3', type: 'beat' as const, timeSeconds: 2, label: '3' },
    ]

    const marker = getActiveMarker(markers, 1.5)

    expect(marker?.id).toBe('beat-2')
  })

  it('resolves the active section and shifts markers when an initial offset is applied', () => {
    const contract = buildTimelineContract({
      bpm: 120,
      timeSignature: [4, 4],
      durationSeconds: 16,
      offsetSeconds: 2,
      sections: [
        { id: 'verse', label: 'Verse', startTimeSeconds: 0, endTimeSeconds: 8 },
        { id: 'chorus', label: 'Chorus', startTimeSeconds: 8, endTimeSeconds: 16 },
      ],
      beats: [
        { timeSeconds: 0, beat: 1, measure: 1, beatInMeasure: 1, label: '1' },
      ],
    })

    expect(getSectionForTime(contract, 9.5)?.id).toBe('verse')
    expect(getSectionForTime(contract, 10)?.id).toBe('chorus')
    expect(contract.markers[0].timeSeconds).toBe(2)
    expect(contract.durationSeconds).toBe(18)
  })
})
