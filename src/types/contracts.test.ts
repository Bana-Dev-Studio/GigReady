import { describe, expect, it } from 'vitest'
import {
  normalizeBeatAnalysisResponse,
  normalizeStemProcessingResponse,
} from './contracts'

describe('contracts release validation', () => {
  it('normalizes partial beat analysis payload without breaking UI assumptions', () => {
    const normalized = normalizeBeatAnalysisResponse({
      trackId: 'track-1',
      durationMs: 120000,
      markers: [
        { beatIndex: 1, timeMs: 0 },
      ],
    })

    expect(normalized.trackId).toBe('track-1')
    expect(normalized.markers).toHaveLength(1)
    expect(normalized.markers[0].measure).toBe(1)
    expect(normalized.markers[0].confidence).toBe(0)
  })

  it('keeps app operable with empty markers array', () => {
    const normalized = normalizeBeatAnalysisResponse({
      trackId: 'track-2',
      durationMs: 0,
      markers: [],
    })

    expect(normalized.markers).toHaveLength(0)
    expect(normalized.durationMs).toBe(0)
  })

  it('normalizes partial stem response preserving required fields', () => {
    const normalized = normalizeStemProcessingResponse({
      trackId: 'track-3',
      originalFileName: 'demo.wav',
      processingTimeMs: 1500,
      stems: [
        {
          id: 'stem-1',
          label: 'Original',
          audioUrl: 'blob:test-url',
        },
      ],
    })

    expect(normalized.trackId).toBe('track-3')
    expect(normalized.stems).toHaveLength(1)
    expect(normalized.stems[0].mimeType).toBe('audio/webm')
    expect(normalized.stems[0].durationMs).toBe(0)
  })

  it('fails fast when stem payload has no usable audio urls', () => {
    expect(() => normalizeStemProcessingResponse({
      trackId: 'track-4',
      originalFileName: 'demo.wav',
      processingTimeMs: 1500,
      stems: [{ id: 'stem-1', label: 'Broken', audioUrl: '' }],
    })).toThrow('no usable stems')
  })
})