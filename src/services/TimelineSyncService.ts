import { getBeatPosition, secondsToBeats } from './TimelineService'

type TimeSignature = [number, number]

type ClockSnapshot = {
  playbackTimeSeconds: number
  bpm: number
  timeSignature: TimeSignature
  beat: number
  measure: number
  beatInMeasure: number
  nextBeatTimeSeconds: number
}

type ClockListener = (snapshot: ClockSnapshot) => void

class TimelineSyncService {
  private listeners = new Set<ClockListener>()

  public getClockSnapshot(params: {
    playbackTimeSeconds: number
    bpm: number
    timeSignature: TimeSignature
  }): ClockSnapshot {
    const beatIndex = Math.floor(secondsToBeats(params.playbackTimeSeconds, params.bpm))
    const beatPosition = getBeatPosition(beatIndex, params.bpm, params.timeSignature)
    const beatDurationSeconds = 60 / params.bpm
    const nextBeatTimeSeconds = (Math.floor(params.playbackTimeSeconds / beatDurationSeconds) + 1) * beatDurationSeconds

    return {
      playbackTimeSeconds: params.playbackTimeSeconds,
      bpm: params.bpm,
      timeSignature: params.timeSignature,
      beat: beatPosition.beat,
      measure: beatPosition.measure,
      beatInMeasure: beatPosition.beatInMeasure,
      nextBeatTimeSeconds,
    }
  }

  public subscribe(listener: ClockListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  public notify(snapshot: ClockSnapshot): void {
    this.listeners.forEach((listener) => listener(snapshot))
  }
}

export const timelineSyncService = new TimelineSyncService()
export type { ClockSnapshot }
