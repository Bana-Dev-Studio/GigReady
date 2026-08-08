import { errorReporter } from './ErrorReporter'

type AssetStatus = 'idle' | 'loading' | 'ready' | 'error' | 'disposed'

interface AssetEntry {
  status: AssetStatus
  buffer: AudioBuffer | null
  error: string | null
  promise: Promise<AudioBuffer | null> | null
  lastAccessedAt: number
}

interface AudioAssetManagerConfig {
  maxEntries: number
}

export class AudioAssetManager {
  private static instance: AudioAssetManager | null = null
  private readonly assets = new Map<string, AssetEntry>()
  private config: AudioAssetManagerConfig = { maxEntries: 8 }

  private constructor() {}

  public static getInstance(): AudioAssetManager {
    if (!AudioAssetManager.instance) {
      AudioAssetManager.instance = new AudioAssetManager()
    }
    return AudioAssetManager.instance
  }

  public configure(config: Partial<AudioAssetManagerConfig>): void {
    this.config = { ...this.config, ...config }
    this.evictIfNeeded()
  }

  public async load(url: string): Promise<AudioBuffer | null> {
    const existing = this.assets.get(url)
    if (existing?.status === 'ready' && existing.buffer) {
      existing.lastAccessedAt = Date.now()
      errorReporter.recordMetric('audio-asset', 'cache-hit', 1, { url })
      return existing.buffer
    }

    if (existing?.promise) {
      existing.lastAccessedAt = Date.now()
      return existing.promise
    }

    if (existing?.status === 'disposed') {
      this.assets.delete(url)
    }

    const entry: AssetEntry = {
      status: 'loading',
      buffer: null,
      error: null,
      promise: null,
      lastAccessedAt: Date.now(),
    }
    this.assets.set(url, entry)
    this.evictIfNeeded()

    entry.promise = this.decodeAsset(url, entry)
    try {
      const result = await entry.promise
      entry.buffer = result
      entry.status = result ? 'ready' : 'error'
      entry.lastAccessedAt = Date.now()
      errorReporter.recordMetric('audio-asset', 'cache-miss', 1, { url })
      return result
    } catch (error) {
      entry.status = 'error'
      entry.error = error instanceof Error ? error.message : 'Unknown audio asset error'
      throw error
    } finally {
      entry.promise = null
    }
  }

  public getStatus(url: string): AssetStatus {
    return this.assets.get(url)?.status ?? 'idle'
  }

  public async dispose(url?: string): Promise<void> {
    if (url) {
      const entry = this.assets.get(url)
      if (entry) {
        entry.status = 'disposed'
        entry.buffer = null
        entry.error = null
        entry.promise = null
      }
      return
    }

    for (const key of this.assets.keys()) {
      const entry = this.assets.get(key)
      if (entry) {
        entry.status = 'disposed'
        entry.buffer = null
        entry.error = null
        entry.promise = null
      }
    }
  }

  private evictIfNeeded(): void {
    const activeEntries = Array.from(this.assets.entries()).filter(([, entry]) => entry.status !== 'disposed')
    while (activeEntries.length > this.config.maxEntries) {
      const oldestEntry = activeEntries.reduce((oldest, current) => {
        return current[1].lastAccessedAt < oldest[1].lastAccessedAt ? current : oldest
      })

      const [url, entry] = oldestEntry
      entry.status = 'disposed'
      entry.buffer = null
      entry.error = null
      entry.promise = null
      entry.lastAccessedAt = Date.now()
      this.assets.set(url, entry)
      errorReporter.recordMetric('audio-asset', 'eviction', 1, { url })

      const index = activeEntries.findIndex(([candidateUrl]) => candidateUrl === url)
      if (index >= 0) {
        activeEntries.splice(index, 1)
      }
    }
  }

  private async decodeAsset(url: string, entry: AssetEntry): Promise<AudioBuffer | null> {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        errorReporter.record('audio-asset', 'Failed to fetch audio asset', { url, status: response.status })
        throw new Error(`Failed to fetch audio asset: ${response.status}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      const startedAt = performance.now()
      const { audioService } = await import('./AudioService')
      const ctx = await audioService.init()
      const decoded = await ctx.decodeAudioData(arrayBuffer)
      entry.buffer = decoded
      entry.lastAccessedAt = Date.now()
      errorReporter.recordMetric('audio-asset', 'decode-duration', performance.now() - startedAt, { url })
      return decoded
    } catch (error) {
      entry.error = error instanceof Error ? error.message : 'Unknown audio asset error'
      errorReporter.record('audio-asset', 'Audio asset failed to decode', { url, error })
      throw error
    }
  }
}

export const audioAssetManager = AudioAssetManager.getInstance()
