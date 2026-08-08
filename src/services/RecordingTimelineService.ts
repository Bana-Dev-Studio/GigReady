export type RecordingTimelineContract = {
  timelineStartSeconds: number
  timelineEndSeconds: number
  sourceStartSeconds: number
  sourceEndSeconds: number
  sourceDurationSeconds: number
  durationSeconds: number
}

type RecordingTimelineInput = {
  timelineStartSeconds: number
  sourceStartSeconds: number
  sourceEndSeconds: number
  sourceDurationSeconds: number
}

export function buildRecordingTimelineContract(input: RecordingTimelineInput): RecordingTimelineContract {
  const sourceStart = Math.max(0, input.sourceStartSeconds)
  const sourceEnd = Math.max(sourceStart, input.sourceEndSeconds)
  const sourceDuration = Math.max(0, input.sourceDurationSeconds)
  const clampedEnd = Math.min(sourceDuration > 0 ? sourceDuration : sourceEnd, sourceEnd)
  const durationSeconds = Math.max(0, clampedEnd - sourceStart)

  return {
    timelineStartSeconds: input.timelineStartSeconds,
    timelineEndSeconds: input.timelineStartSeconds + durationSeconds,
    sourceStartSeconds: sourceStart,
    sourceEndSeconds: clampedEnd,
    sourceDurationSeconds: sourceDuration,
    durationSeconds,
  }
}
