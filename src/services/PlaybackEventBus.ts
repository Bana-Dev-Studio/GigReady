export type PlaybackEventType = 'playback:started' | 'playback:paused' | 'playback:seeked' | 'playback:error' | 'loading:started' | 'loading:completed' | 'loading:error'

export type PlaybackEventContext = {
  source?: string
  time?: number
  reason?: string
  detail?: unknown
}

export type PlaybackEvent = {
  type: PlaybackEventType
  payload?: PlaybackEventContext
  timestamp: number
}

export class PlaybackEventBus {
  private static instance: PlaybackEventBus | null = null
  private listeners = new Set<(event: PlaybackEvent) => void>()

  private constructor() {}

  public static getInstance(): PlaybackEventBus {
    if (!PlaybackEventBus.instance) {
      PlaybackEventBus.instance = new PlaybackEventBus()
    }
    return PlaybackEventBus.instance
  }

  public subscribe(listener: (event: PlaybackEvent) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  public publish(event: PlaybackEvent): void {
    this.listeners.forEach((listener) => listener(event))
  }

  public publishState(type: PlaybackEventType, payload?: PlaybackEventContext): void {
    this.publish({ type, payload, timestamp: Date.now() })
  }
}

export const playbackEventBus = PlaybackEventBus.getInstance()
