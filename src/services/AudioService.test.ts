import { beforeAll, describe, expect, it, vi } from 'vitest'

describe('AudioService lifecycle', () => {
  it('can schedule clip tracks alongside recorded tracks in a playback request', async () => {
    const { AudioService } = await import('./AudioService')
    const service = AudioService.getInstance()

    const createBufferSource = vi.fn(() => ({
      buffer: null,
      connect: vi.fn(),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      onended: null,
    }))
    const createGain = vi.fn(() => ({
      gain: { value: 1 },
      connect: vi.fn(),
      disconnect: vi.fn(),
    }))

    Object.defineProperty(service, 'ctx', {
      configurable: true,
      value: {
        createBufferSource,
        createGain,
        currentTime: 0,
        destination: {},
      },
    })

    const buffer = { duration: 4 } as AudioBuffer
    const result = service.syncPlayback(0, {
      mainBuffer: null,
      clickBuffer: null,
      isClickEnabled: false,
      clipTracks: [{ buffer, offset: 0, enabled: true }],
    })

    expect(result).toBe(true)
    expect(createBufferSource).toHaveBeenCalledTimes(1)
  })

  it('can schedule stem tracks with per-track gain in a playback request', async () => {
    const { AudioService } = await import('./AudioService')
    const service = AudioService.getInstance()

    const createBufferSource = vi.fn(() => ({
      buffer: null,
      connect: vi.fn(),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      onended: null,
    }))
    const createGain = vi.fn(() => ({
      gain: { value: 1 },
      connect: vi.fn(),
      disconnect: vi.fn(),
    }))

    Object.defineProperty(service, 'ctx', {
      configurable: true,
      value: {
        createBufferSource,
        createGain,
        currentTime: 0,
        destination: {},
      },
    })

    const buffer = { duration: 4 } as AudioBuffer
    const result = service.syncPlayback(0, {
      mainBuffer: null,
      clickBuffer: null,
      isClickEnabled: false,
      stemTracks: [{ buffer, offset: 0, enabled: true, gain: 0.4 }],
    })

    expect(result).toBe(true)
    expect(createGain).toHaveBeenCalledTimes(1)
    expect(createBufferSource).toHaveBeenCalledTimes(1)
  })

  it('routes stem tracks through SoundTouch when applyPitch is enabled', async () => {
    const { AudioService } = await import('./AudioService')
    const service = AudioService.getInstance()

    const sourceConnect = vi.fn()
    const createBufferSource = vi.fn(() => ({
      buffer: null,
      connect: sourceConnect,
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      onended: null,
    }))
    const gainConnect = vi.fn()
    const createGain = vi.fn(() => ({
      gain: { value: 1 },
      connect: gainConnect,
      disconnect: vi.fn(),
    }))
    const soundTouchNode = { pitchSemitones: { value: 0 }, pitch: { value: 1 } }

    Object.defineProperty(service, 'ctx', {
      configurable: true,
      value: {
        createBufferSource,
        createGain,
        currentTime: 0,
        destination: {},
      },
    })

    Object.defineProperty(service, 'stNode', {
      configurable: true,
      value: soundTouchNode,
    })

    const buffer = { duration: 4 } as AudioBuffer
    const result = service.syncPlayback(0, {
      mainBuffer: null,
      clickBuffer: null,
      isClickEnabled: false,
      stemTracks: [{ buffer, offset: 0, enabled: true, gain: 0.8, applyPitch: true }],
    })

    expect(result).toBe(true)
    expect(createGain).toHaveBeenCalledTimes(1)
    expect(sourceConnect).toHaveBeenCalled()
    expect(gainConnect).toHaveBeenCalledWith(soundTouchNode)
  })

  beforeAll(() => {
    class MockAudioWorkletNode {}
    Object.defineProperty(globalThis, 'AudioWorkletNode', {
      configurable: true,
      value: MockAudioWorkletNode,
    })
  })

  it('can be instantiated through the singleton accessor', async () => {
    const { AudioService } = await import('./AudioService')
    const service = AudioService.getInstance()
    expect(service).toBeDefined()
  })
})
