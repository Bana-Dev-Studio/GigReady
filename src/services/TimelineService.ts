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

export type TimelineBeat = {
  timeSeconds: number
  beat: number
  measure: number
  beatInMeasure: number
  label?: string
}

export type TimelineContractInput = {
  bpm: number
  timeSignature: [number, number]
  durationSeconds: number
  offsetSeconds?: number
  sections?: TimelineSection[]
  jumpRoutes?: TimelineJumpRoute[]
  beats?: TimelineBeat[]
}

export type TimelineMarker = {
  id: string
  type: 'beat' | 'section' | 'jump-route'
  timeSeconds: number
  label?: string
  measure?: number
  beatInMeasure?: number
}

export type TimelineContract = {
  bpm: number
  timeSignature: [number, number]
  durationSeconds: number
  offsetSeconds: number
  sections: TimelineSection[]
  jumpRoutes: TimelineJumpRoute[]
  markers: TimelineMarker[]
}

export function secondsToBeats(seconds: number, bpm: number): number {
  return seconds * bpm / 60
}

export function beatsToSeconds(beats: number, bpm: number): number {
  return beats * 60 / bpm
}

export function getBeatPosition(beatIndex: number, _bpm: number, timeSignature: [number, number]) {
  const beat = beatIndex + 1
  const measure = Math.floor(beatIndex / timeSignature[0]) + 1
  const beatInMeasure = (beatIndex % timeSignature[0]) + 1

  return {
    beat,
    measure,
    beatInMeasure,
  }
}

export function buildTimelineContract(input: TimelineContractInput): TimelineContract {
  const offsetSeconds = Math.max(0, input.offsetSeconds ?? 0)
  const markers: TimelineMarker[] = []

  for (const beat of input.beats ?? []) {
    markers.push({
      id: `beat-${beat.beat}`,
      type: 'beat',
      timeSeconds: beat.timeSeconds + offsetSeconds,
      label: beat.label,
      measure: beat.measure,
      beatInMeasure: beat.beatInMeasure,
    })
  }

  for (const section of input.sections ?? []) {
    markers.push({
      id: section.id,
      type: 'section',
      timeSeconds: section.startTimeSeconds + offsetSeconds,
      label: section.label,
    })
  }

  for (const jumpRoute of input.jumpRoutes ?? []) {
    markers.push({
      id: jumpRoute.id,
      type: 'jump-route',
      timeSeconds: jumpRoute.triggerTimeSeconds + offsetSeconds,
      label: jumpRoute.label,
      measure: jumpRoute.fromMeasure,
    })
  }

  return {
    bpm: input.bpm,
    timeSignature: input.timeSignature,
    durationSeconds: input.durationSeconds + offsetSeconds,
    offsetSeconds,
    sections: (input.sections ?? []).map((section) => ({
      ...section,
      startTimeSeconds: section.startTimeSeconds + offsetSeconds,
      endTimeSeconds: section.endTimeSeconds + offsetSeconds,
    })),
    jumpRoutes: (input.jumpRoutes ?? []).map((jumpRoute) => ({
      ...jumpRoute,
      triggerTimeSeconds: jumpRoute.triggerTimeSeconds + offsetSeconds,
      targetTimeSeconds: jumpRoute.targetTimeSeconds + offsetSeconds,
    })),
    markers,
  }
}

export function getActiveMarker(markers: Pick<TimelineMarker, 'timeSeconds' | 'id'>[], playbackTimeSeconds: number) {
  return [...markers].reverse().find((marker) => playbackTimeSeconds >= marker.timeSeconds) ?? null
}

export function getSectionForTime(contract: Pick<TimelineContract, 'sections'>, playbackTimeSeconds: number) {
  const sortedSections = [...contract.sections].sort((left, right) => left.startTimeSeconds - right.startTimeSeconds)

  return sortedSections
    .filter((section) => playbackTimeSeconds >= section.startTimeSeconds && playbackTimeSeconds <= section.endTimeSeconds)
    .at(-1) ?? null
}
