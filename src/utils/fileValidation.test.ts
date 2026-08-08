import { describe, expect, it } from 'vitest'
import { sanitizeFileName, validateAudioFile } from './fileValidation'

describe('file validation release checks', () => {
  it('rejects unsupported mime type', () => {
    const invalidFile = {
      name: 'track.txt',
      size: 1024,
      type: 'text/plain',
    } as File

    const result = validateAudioFile(invalidFile)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('no soportado')
  })

  it('rejects files larger than limit', () => {
    const hugeFile = {
      name: 'track.mp3',
      size: 51 * 1024 * 1024,
      type: 'audio/mpeg',
    } as File

    const result = validateAudioFile(hugeFile)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('demasiado grande')
  })

  it('accepts valid audio file', () => {
    const validFile = {
      name: 'track.mp3',
      size: 2 * 1024 * 1024,
      type: 'audio/mpeg',
    } as File

    const result = validateAudioFile(validFile)
    expect(result.valid).toBe(true)
  })

  it('sanitizes dangerous filename characters', () => {
    const safe = sanitizeFileName('  ..<demo>:"song"?.mp3  ')
    expect(safe).toBe('demosong.mp3')
  })
})