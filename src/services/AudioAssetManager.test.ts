import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockInit = vi.fn()
const mockDecodeAudioData = vi.fn()

vi.mock('./AudioService', () => ({
  audioService: {
    init: mockInit,
  },
}))

import { AudioAssetManager } from './AudioAssetManager'

describe('AudioAssetManager', () => {
  beforeEach(async () => {
    mockInit.mockReset()
    mockDecodeAudioData.mockReset()
    vi.unstubAllGlobals()

    mockInit.mockResolvedValue({
      decodeAudioData: mockDecodeAudioData,
    })

    vi.stubGlobal('fetch', vi.fn())

    const manager = AudioAssetManager.getInstance()
    await manager.dispose()
  })

  it('reuses decoded buffers for the same URL and avoids duplicate decodes', async () => {
    const buffer = {} as AudioBuffer
    mockDecodeAudioData.mockResolvedValue(buffer)

    const fetchMock = vi.mocked(globalThis.fetch as unknown as ReturnType<typeof vi.fn>)
    fetchMock.mockResolvedValue({
      ok: true,
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
    } as unknown as Response)

    const manager = AudioAssetManager.getInstance()
    const first = await manager.load('/audio/track.mp3')
    const second = await manager.load('/audio/track.mp3')

    expect(first).toBe(buffer)
    expect(second).toBe(buffer)
    expect(mockDecodeAudioData).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(manager.getStatus('/audio/track.mp3')).toBe('ready')
  })

  it('evicts the least recently used asset once the cache limit is exceeded', async () => {
    const buffer = {} as AudioBuffer
    mockDecodeAudioData.mockResolvedValue(buffer)

    const fetchMock = vi.mocked(globalThis.fetch as unknown as ReturnType<typeof vi.fn>)
    fetchMock.mockResolvedValue({
      ok: true,
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
    } as unknown as Response)

    const manager = AudioAssetManager.getInstance()
    manager.configure({ maxEntries: 2 })

    await manager.load('/audio/one.mp3')
    await manager.load('/audio/two.mp3')
    await manager.load('/audio/three.mp3')

    expect(manager.getStatus('/audio/one.mp3')).toBe('disposed')
    expect(manager.getStatus('/audio/two.mp3')).toBe('ready')
    expect(manager.getStatus('/audio/three.mp3')).toBe('ready')
  })
})
