import { describe, expect, it, beforeEach } from 'vitest'
import { projectClipRegistry } from './ProjectClipRegistry'

describe('ProjectClipRegistry', () => {
  beforeEach(() => {
    projectClipRegistry.clear()
  })

  it('stores clips created from a draft and exposes them for playback', () => {
    const clip = projectClipRegistry.addClip({
      trackId: 'recording-1',
      startTimeSeconds: 1,
      endTimeSeconds: 3,
      sourceUrl: '/clip.mp3',
    })

    expect(clip.id).toBeTruthy()
    expect(projectClipRegistry.getClips()).toHaveLength(1)
    expect(projectClipRegistry.getClips()[0].sourceUrl).toBe('/clip.mp3')
  })
})
