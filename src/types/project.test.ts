import { describe, expect, it } from 'vitest'
import { createInitialProjectState } from './project'

describe('createInitialProjectState', () => {
  it('creates a usable initial project state with timeline, tracks and empty clips', () => {
    const state = createInitialProjectState()

    expect(state.id).toBeTruthy()
    expect(state.timeline.metronome.bpm).toBeGreaterThan(0)
    expect(state.timeline.markers).toEqual([])
    expect(state.clips).toEqual([])
    expect(state.annotations).toEqual([])
    expect(state.activeTrackIds).toContain('main')
    expect(state.tracks.some((track) => track.id === 'main')).toBe(true)
  })
})
