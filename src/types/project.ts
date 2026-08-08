export type PlaybackMode = 'idle' | 'playing' | 'paused'

export type TransportState = {
  mode: PlaybackMode
  playheadSeconds: number
  durationSeconds: number
  isReady: boolean
  offsetSeconds: number
}

export type MetronomeState = {
  bpm: number
  timeSignature: [number, number]
  enabled: boolean
}

export type TimelineSection = {
  id: string
  label: string
  startTimeSeconds: number
  endTimeSeconds: number
}

export type TimelineJumpRoute = {
  id: string
  label: string
  fromMeasure: number
  toMeasure: number
  triggerTimeSeconds: number
  targetTimeSeconds: number
  maxJumps: number
}

export type TimelineMarker = {
  id: string
  type: 'beat' | 'measure' | 'section' | 'custom' | 'jump-route'
  timeSeconds: number
  label?: string
  measure?: number
  beatInMeasure?: number
}

export type TrackType = 'main' | 'recording' | 'annotation' | 'click'

export type ProjectTrack = {
  id: string
  type: TrackType
  title: string
  sourceUrl?: string | null
  enabled: boolean
  gain: number
  offsetSeconds: number
  durationSeconds?: number
  metadata?: Record<string, string>
}

export type ClipEditState = 'idle' | 'selected' | 'hovered' | 'dragging' | 'trimming'

export type ProjectClip = {
  id: string
  trackId: string
  startTimeSeconds: number
  endTimeSeconds: number
  durationSeconds: number
  offsetSeconds: number
  status: 'ready' | 'recording' | 'error'
  sourceUrl?: string | null
  title?: string
  metadata?: Record<string, string>
  editState?: ClipEditState
  sourceStartSeconds?: number
  sourceEndSeconds?: number
  sourceDurationSeconds?: number
}

export type ProjectAnnotation = {
  id: string
  trackId: string
  startTimeSeconds: number
  endTimeSeconds: number
  label?: string
  color?: string
  metadata?: Record<string, string>
}

export type ProjectTimeline = {
  durationSeconds: number
  markers: TimelineMarker[]
  sections: TimelineSection[]
  jumpRoutes: TimelineJumpRoute[]
  metronome: MetronomeState
  initialCountBeats: number
}

export type ProjectState = {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  transport: TransportState
  timeline: ProjectTimeline
  tracks: ProjectTrack[]
  clips: ProjectClip[]
  annotations: ProjectAnnotation[]
  activeTrackIds: string[]
  selectedTrackIds: string[]
  selectedSongId?: string | null
  metadata?: Record<string, string>
  isDirty: boolean
}

export function createInitialProjectState(): ProjectState {
  return {
    id: `project-${Date.now()}`,
    title: 'Nueva sesión',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    transport: {
      mode: 'idle',
      playheadSeconds: 0,
      durationSeconds: 0,
      isReady: false,
      offsetSeconds: 0,
    },
    timeline: {
      durationSeconds: 0,
      markers: [],
      sections: [],
      jumpRoutes: [],
      metronome: {
        bpm: 120,
        timeSignature: [4, 4],
        enabled: true,
      },
      initialCountBeats: 0,
    },
    tracks: [
      {
        id: 'main',
        type: 'main',
        title: 'Pista principal',
        enabled: true,
        gain: 1,
        offsetSeconds: 0,
      },
      {
        id: 'click',
        type: 'click',
        title: 'Metronomo',
        enabled: false,
        gain: 1,
        offsetSeconds: 0,
      },
    ],
    clips: [],
    annotations: [],
    activeTrackIds: ['main'],
    selectedTrackIds: [],
    selectedSongId: null,
    isDirty: false,
  }
}
