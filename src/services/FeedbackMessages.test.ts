import { beforeEach, describe, expect, it } from 'vitest'
import { buildFeedbackNotice, buildFeedbackNoticeWithTelemetry } from './FeedbackMessages'
import { errorReporter } from './ErrorReporter'

describe('buildFeedbackNotice', () => {
  beforeEach(() => {
    errorReporter.clear()
  })

  it('builds a friendly warning for track loading issues', () => {
    const notice = buildFeedbackNotice('audio-load', 'Failed to decode audio asset')

    expect(notice.level).toBe('warning')
    expect(notice.title).toContain('No se pudo cargar')
    expect(notice.message).toContain('reintentar')
  })

  it('builds a non-blocking notice for playback issues', () => {
    const notice = buildFeedbackNotice('audio-playback', 'Worklet failed')

    expect(notice.level).toBe('warning')
    expect(notice.title).toContain('Playback')
    expect(notice.message).toContain('seguir')
  })

  it('emits fallback telemetry when creating notice with telemetry', () => {
    const notice = buildFeedbackNoticeWithTelemetry('audio-load', 'Failed to process uploaded audio')

    const metrics = errorReporter.getMetrics()
    expect(notice.recoveryAction).toBe('retry-upload')
    expect(metrics).toHaveLength(1)
    expect(metrics[0].scope).toBe('fallback')
    expect(metrics[0].metric).toBe('notice-issued')
  })
})
