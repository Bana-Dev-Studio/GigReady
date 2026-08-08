import { describe, expect, it, beforeEach } from 'vitest'
import { ErrorReporter } from './ErrorReporter'

describe('ErrorReporter', () => {
  let reporter: ErrorReporter

  beforeEach(() => {
    reporter = ErrorReporter.getInstance()
    reporter.clear()
  })

  it('records and exposes events for debugging', () => {
    reporter.record('audio', 'failed to decode asset', { reason: 'invalid data' })

    const events = reporter.getEvents()
    expect(events).toHaveLength(1)
    expect(events[0].scope).toBe('audio')
    expect(events[0].message).toBe('failed to decode asset')
  })
})
