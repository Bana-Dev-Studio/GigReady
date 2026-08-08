import { describe, expect, it } from 'vitest'
import { buildRecordingTimelineContract } from './RecordingTimelineService'

describe('RecordingTimelineService', () => {
  it('computes a clip range from source in/out offsets and a timeline anchor', () => {
    const contract = buildRecordingTimelineContract({
      timelineStartSeconds: 5,
      sourceStartSeconds: 1.5,
      sourceEndSeconds: 4.5,
      sourceDurationSeconds: 6,
    })

    expect(contract.timelineStartSeconds).toBe(5)
    expect(contract.timelineEndSeconds).toBe(8)
    expect(contract.sourceStartSeconds).toBe(1.5)
    expect(contract.sourceEndSeconds).toBe(4.5)
    expect(contract.durationSeconds).toBe(3)
  })
})
