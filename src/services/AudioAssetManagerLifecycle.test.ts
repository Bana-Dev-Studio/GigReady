import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockDispose = vi.fn()

vi.mock('./AudioService', () => ({
  audioService: {
    init: vi.fn().mockResolvedValue({
      decodeAudioData: vi.fn().mockResolvedValue({} as AudioBuffer),
    }),
  },
}))

import { AudioAssetManager } from './AudioAssetManager'

describe('AudioAssetManager lifecycle', () => {
  beforeEach(() => {
    mockDispose.mockReset()
  })

  it('disposes a specific asset entry when requested', async () => {
    const manager = AudioAssetManager.getInstance()
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
    })

    vi.stubGlobal('fetch', fetchMock)
    const decoded = await manager.load('/audio/one.mp3')
    await manager.dispose('/audio/one.mp3')

    expect(decoded).toBeTruthy()
    expect(manager.getStatus('/audio/one.mp3')).toBe('disposed')
  })
})
