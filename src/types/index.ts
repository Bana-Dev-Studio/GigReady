import type { PlaybackMode, TransportState } from './project'

export type Song = {
  id: string
  title: string
  subtitle: string
  status: 'HQ' | 'Pending'
  fileUrl?: string | null
}

export type AudioEngineControls = {
  play: () => void
  pause: () => void
  seek: (time: number) => void
  setJumpRules: (rules: Array<{ id: string; triggerTimeSeconds: number; targetTimeSeconds: number; maxJumps: number }>) => void
  setVolume: (volume: number) => void
  setClickVolume: (volume: number) => void
  setPitch: (semitones: number) => void
  setClickTrackEnabled: (enabled: boolean) => void
  setStemTrackState: (stemId: string, enabled: boolean, gain?: number) => void
}

export type BeatMarker = {
  beatIndex: number
  measure: number
  beatInMeasure: number
  label: string
  timeMs: number
  confidence: number
}

export type WaveformProps = {
  fileUrl: string | null
  songTitle: string
  containerRef: React.RefObject<HTMLDivElement | null>
  controls: AudioEngineControls
}
export type PlayerState = {
  isPlaying: boolean
  currentTime: number
  duration: number
  isReady: boolean
  loadProgress: number
  transport: TransportState
  
  // Acciones
  setIsPlaying: (playing: boolean) => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setIsReady: (ready: boolean) => void
  setLoadProgress: (progress: number) => void
  setPlaybackMode: (mode: PlaybackMode) => void
  setPlayhead: (time: number) => void
  setOffset: (offset: number) => void
}

export type AudioEngineState = {
  isReady: boolean
  isPlaying: boolean
  currentTime: number
  duration: number
  loadProgress: number
}
export type RehearsalProps = {
  pitchOffset: number
  setPitchOffset: (value: number) => void
  clickOn: boolean
  setClickOn: (value: boolean) => void
  compact?: boolean
}

export interface SoundTouchNode extends AudioNode {
  tempo: AudioParam
  pitch: AudioParam
  pitchSemitones: AudioParam
  playbackRate: AudioParam
}

export * from './project'
export type { ClipDraft } from '../services/ClipService'
