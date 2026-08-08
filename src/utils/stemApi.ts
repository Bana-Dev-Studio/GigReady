import { normalizeStemProcessingResponse, type ApiStem, type ApiStemProcessingResponse } from '../types/contracts'

const STEM_MOCK_ENABLED_STORAGE_KEY = 'gigready.stemMockEnabled'

export type StemProcessingRequest = {
  file: File
  trackId?: string
}

export type Stem = ApiStem

export type StemProcessingResponse = ApiStemProcessingResponse

const STEM_CATALOG_URL = '/api/mock-stem-catalog.json'

export function selectMainPlaybackUrl(
  stems: Array<Pick<Stem, 'id' | 'label' | 'mimeType' | 'durationMs'> & { audioUrl?: string }>,
  originalAudioUrl: string | null | undefined,
): string | null {
  if (typeof originalAudioUrl === 'string' && originalAudioUrl.trim().length > 0) {
    return originalAudioUrl
  }

  const firstStem = stems.find((stem) => typeof stem.audioUrl === 'string' && stem.audioUrl.trim().length > 0)
  return firstStem?.audioUrl ?? null
}
const DEFAULT_PROCESSING_TIME_MS = 1200

declare global {
  interface Window {
    gigReady?: {
      setStemMockEnabled?: (enabled: boolean) => void
      isStemMockEnabled?: () => boolean
    }
    trackRehearsal?: {
      setStemMockEnabled?: (enabled: boolean) => void
      isStemMockEnabled?: () => boolean
    }
  }
}

function readStemMockEnabledSetting(): boolean {
  if (typeof window !== 'undefined') {
    const storedValue = window.localStorage.getItem(STEM_MOCK_ENABLED_STORAGE_KEY)
    if (storedValue === 'true') return true
    if (storedValue === 'false') return false
  }

  const envValue = import.meta.env.VITE_ENABLE_STEM_MOCK
  if (typeof envValue === 'string') {
    return envValue.toLowerCase() !== 'false'
  }

  return true
}

export function isStemMockEnabled(): boolean {
  return readStemMockEnabledSetting()
}

export function setStemMockEnabled(enabled: boolean): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STEM_MOCK_ENABLED_STORAGE_KEY, enabled ? 'true' : 'false')
  }
}

if (typeof window !== 'undefined') {
  window.gigReady = {
    ...window.gigReady,
    setStemMockEnabled,
    isStemMockEnabled,
  }

  window.trackRehearsal = {
    ...window.trackRehearsal,
    setStemMockEnabled,
    isStemMockEnabled,
  }
}

type MockStemCatalog = {
  songs?: MockStemSong[]
}

type MockStemSong = {
  id?: string
  title?: string
  bpm?: number
  keySignature?: string
  stems?: MockStemEntry[]
}

type MockStemEntry = {
  id?: string
  label?: string
  audioUrl?: string
  mimeType?: string
  durationMs?: number
}

export async function uploadAndProcessAudio(
  request: StemProcessingRequest,
): Promise<StemProcessingResponse> {
  const response = await simulateStemProcessing(request)
  return normalizeStemProcessingResponse(response)
}

async function simulateStemProcessing(
  request: StemProcessingRequest,
): Promise<StemProcessingResponse> {
  await new Promise((resolve) => setTimeout(resolve, DEFAULT_PROCESSING_TIME_MS))

  const trackId = request.trackId || `track-${Date.now()}`
  const file = request.file

  if (!isStemMockEnabled()) {
    const audioUrl = URL.createObjectURL(file)

    return {
      trackId,
      originalFileName: file.name,
      stems: [
        {
          id: `${trackId}-full`,
          label: 'Original',
          audioUrl,
          mimeType: file.type,
          durationMs: 0,
        },
      ],
      processingTimeMs: DEFAULT_PROCESSING_TIME_MS,
      metadata: {
        bpm: 120,
      },
    }
  }

  const songFromCatalog = await pickSongFromCatalog(file.name)
  if (songFromCatalog) {
    const catalogStems = Array.isArray(songFromCatalog.stems) ? songFromCatalog.stems : []
    const stems = dedupeStems(catalogStems
      .map((stem, index) => ({
        id: stem.id && stem.id.trim().length > 0 ? stem.id : `${trackId}-stem-${index + 1}`,
        label: stem.label && stem.label.trim().length > 0 ? stem.label : `Stem ${index + 1}`,
        audioUrl: toPublicAudioUrl(stem.audioUrl),
        mimeType: stem.mimeType && stem.mimeType.trim().length > 0 ? stem.mimeType : inferMimeType(stem.audioUrl),
        durationMs: typeof stem.durationMs === 'number' && Number.isFinite(stem.durationMs) ? Math.max(0, stem.durationMs) : 0,
      }))
      .filter((stem) => stem.audioUrl.length > 0))

    if (stems.length > 0) {
      return {
        trackId: songFromCatalog.id || trackId,
        originalFileName: file.name,
        stems,
        processingTimeMs: DEFAULT_PROCESSING_TIME_MS,
        metadata: {
          bpm: songFromCatalog.bpm,
          keySignature: songFromCatalog.keySignature,
        },
      }
    }
  }

  const audioUrl = URL.createObjectURL(file)

  return {
    trackId,
    originalFileName: file.name,
    stems: [
      {
        id: `${trackId}-full`,
        label: 'Original',
        audioUrl,
        mimeType: file.type,
        durationMs: 0,
      },
    ],
    processingTimeMs: DEFAULT_PROCESSING_TIME_MS,
    metadata: {
      bpm: 120,
    },
  }
}

async function pickSongFromCatalog(uploadedFileName: string): Promise<MockStemSong | null> {
  try {
    const response = await fetch(STEM_CATALOG_URL, { cache: 'no-store' })
    if (!response.ok) return null

    const payload = (await response.json()) as MockStemCatalog
    const songs = Array.isArray(payload.songs) ? payload.songs.filter((song) => Array.isArray(song.stems) && song.stems.length > 0) : []
    if (songs.length === 0) return null

    const uploadedKey = normalizeText(stripExtension(uploadedFileName))
    const matched = songs.find((song) => {
      const idKey = normalizeText(song.id)
      const titleKey = normalizeText(song.title)
      if (!uploadedKey) return false
      return uploadedKey.includes(idKey) || uploadedKey.includes(titleKey) || idKey.includes(uploadedKey) || titleKey.includes(uploadedKey)
    })

    return matched ?? songs[Math.floor(Math.random() * songs.length)]
  } catch {
    return null
  }
}

function stripExtension(fileName: string): string {
  const lastDotIndex = fileName.lastIndexOf('.')
  if (lastDotIndex <= 0) return fileName
  return fileName.slice(0, lastDotIndex)
}

function normalizeText(value?: string): string {
  if (!value) return ''
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function toPublicAudioUrl(value?: string): string {
  if (!value) return ''
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('blob:') || value.startsWith('/')) {
    return value
  }
  return `/${value.replace(/^\/+/, '')}`
}

function inferMimeType(audioUrl?: string): string {
  const lowerValue = (audioUrl || '').toLowerCase()
  if (lowerValue.endsWith('.wav')) return 'audio/wav'
  if (lowerValue.endsWith('.flac')) return 'audio/flac'
  if (lowerValue.endsWith('.aac')) return 'audio/aac'
  if (lowerValue.endsWith('.ogg')) return 'audio/ogg'
  if (lowerValue.endsWith('.m4a')) return 'audio/mp4'
  if (lowerValue.endsWith('.aif') || lowerValue.endsWith('.aiff')) return 'audio/aiff'
  return 'audio/mpeg'
}

function dedupeStems(stems: Stem[]): Stem[] {
  const seenIds = new Set<string>()
  const seenUrls = new Set<string>()
  const unique: Stem[] = []

  stems.forEach((stem) => {
    const stemId = stem.id.trim()
    const stemUrl = stem.audioUrl.trim()
    if (seenIds.has(stemId) || seenUrls.has(stemUrl)) {
      return
    }

    seenIds.add(stemId)
    seenUrls.add(stemUrl)
    unique.push(stem)
  })

  return unique
}
