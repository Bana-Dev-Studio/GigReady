import { describe, expect, it } from 'vitest'
import { usePlayerStore } from '../store/usePlayerStore'
import { getBeatPosition, secondsToBeats } from '../services/TimelineService'

describe('ClickTrackTimeline timing logic', () => {
  it('derives the current beat and measure from playback time', () => {
    usePlayerStore.setState({ currentTime: 2 })

    const currentBeat = Math.max(1, Math.floor(secondsToBeats(usePlayerStore.getState().currentTime, 120)) + 1)
    const currentPosition = getBeatPosition(currentBeat - 1, 120, [4, 4])

    expect(currentPosition.beat).toBe(5)
    expect(currentPosition.measure).toBe(2)
  })
})
