export type ApiBeatMarker = {
  beatIndex: number
  measure: number
  beatInMeasure: number
  label: string
  timeMs: number
  confidence: number
}

export type ApiBpmSegment = {
  startMs: number
  endMs: number
  bpm: number
}

export type ApiBeatAnalysisResponse = {
  trackId: string
  durationMs: number
  markers: ApiBeatMarker[]
  bpm?: number
  clickTrackUrl?: string | null
  bpmSegments?: ApiBpmSegment[]
}

export type ApiStemMetadata = {
  bpm?: number
  keySignature?: string
}

export type ApiStem = {
  id: string
  label: string
  audioUrl: string
  mimeType: string
  durationMs: number
}

export type ApiStemProcessingResponse = {
  trackId: string
  originalFileName: string
  stems: ApiStem[]
  processingTimeMs: number
  metadata?: ApiStemMetadata
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function toFiniteNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function toOptionalFiniteNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function toString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback
}

function normalizeBeatMarker(input: unknown, index: number): ApiBeatMarker {
  if (!isObject(input)) {
    throw new Error(`Invalid marker at index ${index}`)
  }

  return {
    beatIndex: Math.max(0, Math.trunc(toFiniteNumber(input.beatIndex, index + 1))),
    measure: Math.max(1, Math.trunc(toFiniteNumber(input.measure, 1))),
    beatInMeasure: Math.max(1, Math.trunc(toFiniteNumber(input.beatInMeasure, 1))),
    label: toString(input.label, `${index + 1}`),
    timeMs: Math.max(0, toFiniteNumber(input.timeMs, 0)),
    confidence: Math.max(0, Math.min(100, toFiniteNumber(input.confidence, 0))),
  }
}

function normalizeBpmSegment(input: unknown): ApiBpmSegment | null {
  if (!isObject(input)) return null

  const startMs = Math.max(0, toFiniteNumber(input.startMs, 0))
  const endMs = Math.max(startMs, toFiniteNumber(input.endMs, startMs))
  const bpm = Math.max(0, toFiniteNumber(input.bpm, 0))

  return {
    startMs,
    endMs,
    bpm,
  }
}

export function normalizeBeatAnalysisResponse(input: unknown): ApiBeatAnalysisResponse {
  if (!isObject(input)) {
    throw new Error('Invalid beat analysis response payload')
  }

  const markersInput = Array.isArray(input.markers) ? input.markers : []
  const markers = markersInput.map((marker, index) => normalizeBeatMarker(marker, index))

  return {
    trackId: toString(input.trackId, 'unknown-track'),
    durationMs: Math.max(0, toFiniteNumber(input.durationMs, 0)),
    markers,
    bpm: toOptionalFiniteNumber(input.bpm),
    clickTrackUrl: typeof input.clickTrackUrl === 'string' ? input.clickTrackUrl : input.clickTrackUrl === null ? null : undefined,
    bpmSegments: Array.isArray(input.bpmSegments)
      ? input.bpmSegments
          .map(normalizeBpmSegment)
          .filter((segment): segment is ApiBpmSegment => segment !== null)
      : undefined,
  }
}

function normalizeStem(input: unknown, index: number): ApiStem {
  if (!isObject(input)) {
    throw new Error(`Invalid stem at index ${index}`)
  }

  return {
    id: toString(input.id, `stem-${index + 1}`),
    label: toString(input.label, `Stem ${index + 1}`),
    audioUrl: toString(input.audioUrl, ''),
    mimeType: toString(input.mimeType, 'audio/webm'),
    durationMs: Math.max(0, toFiniteNumber(input.durationMs, 0)),
  }
}

export function normalizeStemProcessingResponse(input: unknown): ApiStemProcessingResponse {
  if (!isObject(input)) {
    throw new Error('Invalid stem processing response payload')
  }

  const stemsInput = Array.isArray(input.stems) ? input.stems : []
  const stems = stemsInput.map((stem, index) => normalizeStem(stem, index)).filter((stem) => stem.audioUrl.length > 0)

  if (stems.length === 0) {
    throw new Error('Stem processing response contains no usable stems')
  }

  return {
    trackId: toString(input.trackId, 'unknown-track'),
    originalFileName: toString(input.originalFileName, 'unknown-audio'),
    stems,
    processingTimeMs: Math.max(0, toFiniteNumber(input.processingTimeMs, 0)),
    metadata: isObject(input.metadata)
      ? {
          bpm: toOptionalFiniteNumber(input.metadata.bpm),
          keySignature: typeof input.metadata.keySignature === 'string' ? input.metadata.keySignature : undefined,
        }
      : undefined,
  }
}