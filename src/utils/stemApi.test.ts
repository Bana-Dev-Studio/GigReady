import { describe, expect, it } from 'vitest'
import { selectMainPlaybackUrl } from './stemApi'

describe('selectMainPlaybackUrl', () => {
  it('prefers the original uploaded audio over the first processed stem', () => {
    const stems = [
      { id: 'bass', label: 'Bass', audioUrl: 'https://example.com/bass.mp3', mimeType: 'audio/mpeg', durationMs: 1000 },
    ]

    const playbackUrl = selectMainPlaybackUrl(stems, 'blob:original-audio')

    expect(playbackUrl).toBe('blob:original-audio')
  })

  it('falls back to the first stem when no original playback url is provided', () => {
    const stems = [
      { id: 'bass', label: 'Bass', audioUrl: 'https://example.com/bass.mp3', mimeType: 'audio/mpeg', durationMs: 1000 },
      { id: 'drums', label: 'Drums', audioUrl: 'https://example.com/drums.mp3', mimeType: 'audio/mpeg', durationMs: 1000 },
    ]

    expect(selectMainPlaybackUrl(stems, null)).toBe('https://example.com/bass.mp3')
  })
})
