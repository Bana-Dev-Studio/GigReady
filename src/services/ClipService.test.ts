import { describe, expect, it } from 'vitest'
import { ClipService } from './ClipService'

describe('ClipService', () => {
  it('creates a clip with a normalized duration', () => {
    const clip = ClipService.createClip({
      trackId: 'recording-1',
      startTimeSeconds: 2,
      endTimeSeconds: 5,
      title: 'Take 1',
    })

    expect(clip.durationSeconds).toBe(3)
    expect(clip.status).toBe('ready')
    expect(clip.title).toBe('Take 1')
  })

  it('updates the clip status without changing its identity', () => {
    const clip = ClipService.createClip({
      trackId: 'recording-1',
      startTimeSeconds: 1,
      endTimeSeconds: 2,
    })

    const updated = ClipService.updateClipStatus(clip, 'recording')

    expect(updated.id).toBe(clip.id)
    expect(updated.status).toBe('recording')
  })

  it('selects and moves clips through domain operations', () => {
    const clip = ClipService.createClip({
      trackId: 'recording-1',
      startTimeSeconds: 1,
      endTimeSeconds: 3,
    })

    const selected = ClipService.selectClip(clip, true)
    const moved = ClipService.moveClip(selected, 1.5)

    expect(selected.editState).toBe('selected')
    expect(moved.startTimeSeconds).toBe(2.5)
    expect(moved.endTimeSeconds).toBe(4.5)
    expect(moved.editState).toBe('dragging')
  })

  it('trims a clip without producing a negative duration', () => {
    const clip = ClipService.createClip({
      trackId: 'recording-1',
      startTimeSeconds: 4,
      endTimeSeconds: 8,
    })

    const trimmed = ClipService.trimClip(clip, -2, -1)

    expect(trimmed.startTimeSeconds).toBe(2)
    expect(trimmed.endTimeSeconds).toBe(7)
    expect(trimmed.durationSeconds).toBe(5)
  })
})
