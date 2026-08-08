import { useEffect, useMemo, useRef, useState, useCallback, type ChangeEvent } from 'react'
import Sidebar from './components/Sidebar'
import Waveform from './components/Waveform'
import RehearsalMonitor from './components/RehearsalMonitor'
import ClickTrackTimeline from './components/ClickTrackTimeline'
import Recorder from './components/Recorder'
import { useAudioEngine } from './hooks/useAudioEngine'
import { useStemProcessing } from './hooks/useStemProcessing'
import { validateAudioFile, sanitizeFileName } from './utils/fileValidation'
import { fetchBeatAnalysisMock, type BeatAnalysis } from './utils/mockApi'
import { beatsToSeconds, buildTimelineContract } from './services/TimelineService'
import type { ProjectState, Song } from './types'
import { ClipService } from './services/ClipService'
import { useTrackLoader } from './hooks/useTrackLoader'
import { Check, ChevronLeft, ChevronRight, Clock3, Copy, Download, Layers3, Library, ListMusic, Play, Plus, Trash2, X } from 'lucide-react'
import { Icon } from './utils/Icon'
import { projectClipRegistry } from './services/ProjectClipRegistry'
import { buildFeedbackNoticeWithTelemetry } from './services/FeedbackMessages'
import { errorReporter } from './services/ErrorReporter'
import { playbackEventBus } from './services/PlaybackEventBus'
import { usePlaybackOrchestrator } from './services/PlaybackOrchestrator'
import { usePlayerStore } from './store/usePlayerStore'
import { timelineSyncService } from './services/TimelineSyncService'
import { ProjectDomainService } from './services/ProjectDomainService'
import { sessionRecoveryService } from './services/SessionRecoveryService'
import { selectMainPlaybackUrl, type Stem } from './utils/stemApi'

const initialSongs: Song[] = [
]

const RECORDED_TRACKS_PAGE_SIZE = 20

type WorkspacePanelId = 'waveform' | 'stems' | 'recordings' | 'timeline'

const WORKSPACE_PANELS: Array<{ id: WorkspacePanelId; label: string }> = [
  { id: 'waveform', label: 'Reproductor' },
  { id: 'stems', label: 'Stems disponibles' },
  { id: 'recordings', label: 'Pistas grabadas' },
  { id: 'timeline', label: 'Timeline' },
]

type SessionUiContext = {
  songs: Song[]
  availableStems: Array<Pick<Stem, 'id' | 'label' | 'mimeType' | 'durationMs'> & { audioUrl?: string }>
  selectedStemId: string | null
}

function parseSessionUiContext(metadata?: Record<string, string>): SessionUiContext {
  if (!metadata?.sessionUiContext) {
    return {
      songs: initialSongs,
      availableStems: [],
      selectedStemId: null,
    }
  }

  try {
    const parsed = JSON.parse(metadata.sessionUiContext) as Partial<SessionUiContext>

    return {
      songs: Array.isArray(parsed.songs) ? parsed.songs.filter((song): song is Song => Boolean(song?.id && song.title)) : initialSongs,
      availableStems: Array.isArray(parsed.availableStems)
        ? parsed.availableStems.filter((stem): stem is SessionUiContext['availableStems'][number] => Boolean(stem?.id && stem.label))
        : [],
      selectedStemId: typeof parsed.selectedStemId === 'string' ? parsed.selectedStemId : null,
    }
  } catch {
    return {
      songs: initialSongs,
      availableStems: [],
      selectedStemId: null,
    }
  }
}

function buildSessionUiContext(songs: Song[], stems: Array<Pick<Stem, 'id' | 'label' | 'mimeType' | 'durationMs'> & { audioUrl?: string }>, selectedStemId: string | null): string {
  return JSON.stringify({
    songs: songs.map((song) => ({
      id: song.id,
      title: song.title,
      subtitle: song.subtitle,
      status: song.status,
    })),
    availableStems: stems.map((stem) => ({
      id: stem.id,
      label: stem.label,
      mimeType: stem.mimeType,
      durationMs: stem.durationMs,
    })),
    selectedStemId,
  })
}

function App() {
  const appRenderCount = useRef(0)
  const recordedUrlRefCount = useRef<Map<string, number>>(new Map())
  const [project, setProject] = useState<ProjectState>(() => {
    const restored = sessionRecoveryService.load() as ProjectState | null
    return restored ?? ProjectDomainService.createSession()
  })
  const restoredUiContext = parseSessionUiContext(project.metadata)
  const [songs, setSongs] = useState<Song[]>(() => restoredUiContext.songs)
  const [selectedSongId, setSelectedSongId] = useState<string | null>(() => project.selectedSongId ?? restoredUiContext.songs[0]?.id ?? null)
  const [currentFileUrl, setCurrentFileUrl] = useState<string | null>(null)
  const [beatAnalysis, setBeatAnalysis] = useState<BeatAnalysis | null>(null)
  const [availableStems, setAvailableStems] = useState<Array<Pick<Stem, 'id' | 'label' | 'mimeType' | 'durationMs'> & { audioUrl?: string }>>(() => restoredUiContext.availableStems)
  const [selectedStemId, setSelectedStemId] = useState<string | null>(() => restoredUiContext.selectedStemId)
  const [hoveredRecordedClipId, setHoveredRecordedClipId] = useState<string | null>(null)
  const timelineContract = useMemo(() => buildTimelineContract({
    bpm: project.timeline.metronome.bpm,
    timeSignature: project.timeline.metronome.timeSignature,
    durationSeconds: project.timeline.durationSeconds,
    offsetSeconds: project.transport.offsetSeconds,
    sections: project.timeline.sections,
    jumpRoutes: project.timeline.jumpRoutes,
    beats: project.timeline.markers
      .filter((marker) => marker.type === 'beat')
      .map((marker) => ({
        timeSeconds: marker.timeSeconds,
        beat: marker.measure != null && marker.beatInMeasure != null
          ? ((marker.measure - 1) * project.timeline.metronome.timeSignature[0]) + marker.beatInMeasure
          : marker.beatInMeasure ?? 0,
        measure: marker.measure ?? 1,
        beatInMeasure: marker.beatInMeasure ?? 1,
        label: marker.label,
      })),
  }), [project.timeline])
  const [pitchOffset, setPitchOffset] = useState(0)
  const [clickOn, setClickOn] = useState(false)
  const clickVolume = 1
  const [stemMixState, setStemMixState] = useState<Record<string, { enabled: boolean; gain: number }>>({})
  const [visibleRecordedTracksCount, setVisibleRecordedTracksCount] = useState(RECORDED_TRACKS_PAGE_SIZE)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [sidebarOverlay, setSidebarOverlay] = useState(false)
  const [activeWorkspacePanel, setActiveWorkspacePanel] = useState<WorkspacePanelId>('waveform')
  const [feedbackNotice, setFeedbackNotice] = useState<ReturnType<typeof buildFeedbackNoticeWithTelemetry> | null>(null)
  const wasAppLoadingRef = useRef(false)

  // Stem processing hook - procesa archivos a través de la API
  const { isProcessing: isProcessingStem, error: stemError, processAudioFile } = useStemProcessing()
  const { delayedLoading: isMainLoading } = useTrackLoader(currentFileUrl);
  const isAppLoading = isProcessingStem || isMainLoading;
  const getLoadingMessage = () => {
  if (isProcessingStem) return "Procesando stems en el servidor...";
  if (isMainLoading) return "Decodificando audio en memoria...";
  return "Preparando motor de audio...";
};

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      sessionRecoveryService.save(ProjectDomainService.toSnapshot(project))
    }, 250)

    return () => window.clearTimeout(timeoutId)
  }, [project])

  useEffect(() => {
    setProject((prev) => ProjectDomainService.updateSession(prev, {
      metadata: {
        ...prev.metadata,
        sessionUiContext: buildSessionUiContext(songs, availableStems, selectedStemId),
      },
    }))
  }, [availableStems, selectedStemId, songs])

  // Audio engine hook - ÚNICA instancia
  const clickTrackUrl = beatAnalysis?.clickTrackUrl ?? null
  const [recordedTracks, setRecordedTracks] = useState<Array<{ id: string; clipId?: string; title: string; url: string; offset: number; gain?: number; enabled?: boolean; duration?: number; offsetText?: string }>>([])
  const { containerRef, controls: audioControls, feedbackNotice: audioFeedbackNotice } = useAudioEngine(currentFileUrl, clickTrackUrl, recordedTracks, availableStems)
  const processingErrorNotice = stemError ? buildFeedbackNoticeWithTelemetry('audio-load', stemError) : null
  const effectiveFeedbackNotice = feedbackNotice ?? audioFeedbackNotice ?? processingErrorNotice

  useEffect(() => {
    if (availableStems.length === 0) {
      setStemMixState({})
      return
    }

    setStemMixState((prev) => {
      let changed = false
      const next: Record<string, { enabled: boolean; gain: number }> = {}

      availableStems.forEach((stem) => {
        const existing = prev[stem.id]
        const value = existing ?? {
          enabled: true,
          gain: 1,
        }

        next[stem.id] = value
        if (!existing) {
          changed = true
        }

        audioControls.setStemTrackState(stem.id, value.enabled, value.gain)
      })

      if (Object.keys(prev).some((stemId) => !next[stemId])) {
        changed = true
      }

      return changed ? next : prev
    })
  }, [audioControls, availableStems])

  useEffect(() => {
    appRenderCount.current += 1
    errorReporter.recordMetric('ui-render', 'app-render', appRenderCount.current, {
      selectedSongId,
      availableStems: availableStems.length,
      recordedTracks: recordedTracks.length,
    })
  })

  usePlaybackOrchestrator()

  useEffect(() => {
    if (isAppLoading) {
      playbackEventBus.publishState('loading:started', { source: 'app' })
      errorReporter.recordMetric('loading', 'session-loading-started', 1, {
        isProcessingStem,
        isMainLoading,
      })
      setFeedbackNotice(null)
    }
  }, [isAppLoading, isMainLoading, isProcessingStem])

  useEffect(() => {
    const wasLoading = wasAppLoadingRef.current
    if (wasLoading && !isAppLoading) {
      playbackEventBus.publishState('loading:completed', { source: 'app' })
      errorReporter.recordMetric('loading', 'session-loading-ready', 1)
    }
    wasAppLoadingRef.current = isAppLoading
  }, [isAppLoading])
  useEffect(() => {
    audioControls.setPitch(pitchOffset)
  }, [pitchOffset, audioControls])

  useEffect(() => {
    audioControls.setClickTrackEnabled(clickOn)
  }, [clickOn, audioControls])

  useEffect(() => {
    audioControls.setClickVolume(clickVolume)
  }, [clickVolume, audioControls])

  useEffect(() => {
    usePlayerStore.getState().setOffset(project.transport.offsetSeconds)
  }, [project.transport.offsetSeconds])

  useEffect(() => {
    audioControls.setJumpRules((project.timeline.jumpRoutes ?? []).map((jumpRoute) => ({
      id: jumpRoute.id,
      triggerTimeSeconds: jumpRoute.triggerTimeSeconds,
      targetTimeSeconds: jumpRoute.targetTimeSeconds,
      maxJumps: jumpRoute.maxJumps,
    })))
  }, [audioControls, project.timeline.jumpRoutes])

  const retainRecordedBlobUrl = useCallback((url: string) => {
    if (!url.startsWith('blob:')) return
    const current = recordedUrlRefCount.current.get(url) ?? 0
    recordedUrlRefCount.current.set(url, current + 1)
  }, [])

  const releaseRecordedBlobUrl = useCallback((url: string) => {
    if (!url.startsWith('blob:')) return
    const current = recordedUrlRefCount.current.get(url)
    if (!current) return
    if (current === 1) {
      URL.revokeObjectURL(url)
      recordedUrlRefCount.current.delete(url)
      return
    }
    recordedUrlRefCount.current.set(url, current - 1)
  }, [])

  useEffect(() => {
    return () => {
      recordedUrlRefCount.current.forEach((_, url) => {
        URL.revokeObjectURL(url)
      })
      recordedUrlRefCount.current.clear()
    }
  }, [])

  useEffect(() => {
    setVisibleRecordedTracksCount((prev) => {
      if (recordedTracks.length <= RECORDED_TRACKS_PAGE_SIZE) {
        return RECORDED_TRACKS_PAGE_SIZE
      }
      return Math.min(Math.max(prev, RECORDED_TRACKS_PAGE_SIZE), recordedTracks.length)
    })
  }, [recordedTracks.length])

  const selectedSong = useMemo(
    () => songs.find((song) => song.id === selectedSongId) ?? initialSongs[0],
    [selectedSongId, songs],
  )

  const songTitle = selectedSong?.title ?? 'Selecciona una canción'

  const activeWorkspacePanelIndex = useMemo(
    () => WORKSPACE_PANELS.findIndex((panel) => panel.id === activeWorkspacePanel),
    [activeWorkspacePanel],
  )

  const handleWorkspacePanelStep = useCallback((direction: 'prev' | 'next') => {
    setActiveWorkspacePanel((prev) => {
      const currentIndex = WORKSPACE_PANELS.findIndex((panel) => panel.id === prev)
      const step = direction === 'next' ? 1 : -1
      const nextIndex = (currentIndex + step + WORKSPACE_PANELS.length) % WORKSPACE_PANELS.length
      return WORKSPACE_PANELS[nextIndex].id
    })
  }, [])

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      // Validar archivo
      const validation = validateAudioFile(file)
      if (!validation.valid) {
        errorReporter.record('audio-load', 'Upload validation failed', {
          fileName: file.name,
          reason: validation.error,
        })
        setFeedbackNotice(buildFeedbackNoticeWithTelemetry('audio-load', validation.error ?? 'Archivo no válido'))
        event.target.value = ''
        return
      }

      errorReporter.recordMetric('audio-load', 'upload-processing-started', 1, {
        fileName: file.name,
        fileType: file.type,
        fileSizeBytes: file.size,
      })

      // Procesar archivo a través de la API (mock)
      processAudioFile(file)
        .then((response) => {
          if (!response) {
            errorReporter.record('audio-load', 'Processing returned null response', {
              fileName: file.name,
            })
            setFeedbackNotice(buildFeedbackNoticeWithTelemetry('audio-load', 'No se pudo procesar el audio'))
            return
          }

          // Usar el primer stem (por ahora)
          // En el futuro aquí podríamos mostrar una UI para elegir qué stems usar
          const primaryStem = response.stems[0]
          if (!primaryStem) {
            errorReporter.record('audio-load', 'Processing returned no stems', {
              trackId: response.trackId,
            })
            setFeedbackNotice(buildFeedbackNoticeWithTelemetry('audio-load', 'No se obtuvieron stems del procesamiento'))
            return
          }

          errorReporter.recordMetric('audio-load', 'upload-processing-succeeded', 1, {
            trackId: response.trackId,
            stemsCount: response.stems.length,
            processingTimeMs: response.processingTimeMs,
          })

          // Sanitizar nombre del archivo
          const sanitizedTitle = sanitizeFileName(file.name)

          const mainPlaybackUrl = selectMainPlaybackUrl(response.stems, null)

          setAvailableStems(response.stems)
          setSelectedStemId(null)

          const newSong: Song = {
            id: response.trackId,
            title: sanitizedTitle,
            subtitle: `Procesado (${response.stems.length} stem${response.stems.length === 1 ? '' : 's'})`,
            status: 'HQ',
            fileUrl: mainPlaybackUrl,
          }

          setSongs((prevSongs) => [newSong, ...prevSongs])
          setSelectedSongId(newSong.id)
          setCurrentFileUrl(mainPlaybackUrl)
          setProject((prev) => ProjectDomainService.updateSession(prev, {
            title: sanitizedTitle,
            selectedSongId: newSong.id,
            metadata: {
              ...prev.metadata,
              originalFileName: response.originalFileName,
              stemLabel: primaryStem.label,
              stemCount: String(response.stems.length),
              bpm: response.metadata?.bpm?.toString() ?? prev.metadata?.bpm ?? '120',
            },
            transport: {
              ...prev.transport,
              isReady: false,
            },
          }))
        })
        .catch((error) => {
          console.error('Error procesando archivo:', error)
          playbackEventBus.publishState('loading:error', { source: 'upload' })
          errorReporter.record('audio-load', 'Failed to process uploaded audio', error)
          errorReporter.recordMetric('audio-load', 'upload-processing-failed', 1)
          setFeedbackNotice(buildFeedbackNoticeWithTelemetry('audio-load', 'Failed to process uploaded audio'))
        })
        .finally(() => {
          event.target.value = ''
        })
    },
    [processAudioFile],
  )

  const handleSongSelect = useCallback(
    (id: string) => {
      const nextSong = songs.find((song) => song.id === id)
      if (!nextSong) return

      const nextStem = availableStems.find((stem) => stem.audioUrl === nextSong.fileUrl) ?? null
      setSelectedSongId(id)
      setSelectedStemId(nextStem?.id ?? null)
      setCurrentFileUrl(nextStem?.audioUrl ?? nextSong.fileUrl ?? null)
      setProject((prev) => {
        const nextMetadata = {
          ...prev.metadata,
        }

        if (nextStem) {
          nextMetadata.activeStemId = nextStem.id
          nextMetadata.activeStemLabel = nextStem.label
        } else {
          delete nextMetadata.activeStemId
          delete nextMetadata.activeStemLabel
        }

        return ProjectDomainService.updateSession(prev, {
          title: nextSong.title,
          selectedSongId: id,
          metadata: nextMetadata,
        })
      })
    },
    [availableStems, songs],
  )

  const handleStemToggle = useCallback((stemId: string, enabled: boolean) => {
    setStemMixState((prev) => {
      const nextState = {
        enabled,
        gain: prev[stemId]?.gain ?? 1,
      }
      audioControls.setStemTrackState(stemId, enabled, nextState.gain)
      return {
        ...prev,
        [stemId]: nextState,
      }
    })
  }, [audioControls])

  const handleStemVolumeChange = useCallback((stemId: string, gain: number) => {
    setStemMixState((prev) => {
      const nextState = {
        enabled: prev[stemId]?.enabled ?? true,
        gain,
      }
      audioControls.setStemTrackState(stemId, nextState.enabled, gain)
      return {
        ...prev,
        [stemId]: nextState,
      }
    })
  }, [audioControls])

  const seekToTimelineTime = useCallback((timelineTimeSeconds: number) => {
    audioControls.seek(timelineTimeSeconds)
  }, [audioControls])

  const handleSeekFromMarker = useCallback((time: number) => {
    seekToTimelineTime(time)
  }, [seekToTimelineTime])

  const handleSectionNavigation = useCallback((time: number) => {
    seekToTimelineTime(time)
  }, [seekToTimelineTime])

  const resolveMeasureStartTime = useCallback((measure: number) => {
    const beatMarkers = (timelineContract?.markers ?? [])
      .filter((marker) => marker.type === 'beat' && marker.measure != null)
      .sort((left, right) => left.timeSeconds - right.timeSeconds)

    if (beatMarkers.length === 0) return null

    const measureStart = beatMarkers.find((marker) => marker.measure === measure && marker.beatInMeasure === 1)
      ?? beatMarkers.find((marker) => marker.measure === measure)

    return measureStart?.timeSeconds ?? null
  }, [timelineContract?.markers])

  const handleApplyInitialCount = useCallback((beats: number, bpm: number) => {
    const sanitizedBeats = Math.max(0, Math.floor(beats))
    const sanitizedBpm = Math.max(1, Math.floor(bpm))
    const offsetSeconds = beatsToSeconds(sanitizedBeats, sanitizedBpm)

    usePlayerStore.getState().setOffset(offsetSeconds)
    setProject((prev) => ProjectDomainService.updateSession(prev, {
      transport: {
        ...prev.transport,
        offsetSeconds,
      },
      timeline: {
        ...prev.timeline,
        initialCountBeats: sanitizedBeats,
        metronome: {
          ...prev.timeline.metronome,
          bpm: sanitizedBpm,
        },
      },
      metadata: {
        ...prev.metadata,
        bpm: String(sanitizedBpm),
      },
    }))
  }, [])

  const handleClearInitialCount = useCallback(() => {
    usePlayerStore.getState().setOffset(0)
    setProject((prev) => ProjectDomainService.updateSession(prev, {
      transport: {
        ...prev.transport,
        offsetSeconds: 0,
      },
      timeline: {
        ...prev.timeline,
        initialCountBeats: 0,
      },
    }))
  }, [])

  const handleAddJumpRoute = useCallback((fromMeasure: number, toMeasure: number, maxJumps: number) => {
    if (fromMeasure === toMeasure) return

    const triggerTimeSeconds = resolveMeasureStartTime(fromMeasure + 1) ?? project.timeline.durationSeconds
    const targetTimeSeconds = resolveMeasureStartTime(toMeasure)
    if (targetTimeSeconds == null) return

    const sanitizedMaxJumps = fromMeasure < toMeasure ? 1 : Math.max(1, Math.floor(maxJumps))

    setProject((prev) => {
      const currentJumpRoutes = prev.timeline.jumpRoutes ?? []
      const alreadyDefined = currentJumpRoutes.some((jumpRoute) => (
        jumpRoute.fromMeasure === fromMeasure
        && jumpRoute.toMeasure === toMeasure
        && jumpRoute.maxJumps === sanitizedMaxJumps
      ))

      if (alreadyDefined) return prev

      const nextIndex = currentJumpRoutes.filter((jumpRoute) => jumpRoute.id.startsWith('user-jump-')).length + 1
      return ProjectDomainService.updateSession(prev, {
        timeline: {
          ...prev.timeline,
          jumpRoutes: [
            ...currentJumpRoutes,
            {
              id: `user-jump-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
              label: `Salto ${nextIndex}`,
              fromMeasure,
              toMeasure,
              triggerTimeSeconds,
              targetTimeSeconds,
              maxJumps: sanitizedMaxJumps,
            },
          ],
        },
      })
    })
  }, [project.timeline.durationSeconds, resolveMeasureStartTime])

  const handleRemoveJumpRoute = useCallback((jumpRouteId: string) => {
    setProject((prev) => ProjectDomainService.updateSession(prev, {
      timeline: {
        ...prev.timeline,
        jumpRoutes: (prev.timeline.jumpRoutes ?? []).filter((jumpRoute) => jumpRoute.id !== jumpRouteId),
      },
    }))
  }, [])

  useEffect(() => {
    const unsubscribe = usePlayerStore.subscribe((state) => {
      const snapshot = timelineSyncService.getClockSnapshot({
        playbackTimeSeconds: state.currentTime,
        bpm: project.timeline.metronome.bpm,
        timeSignature: project.timeline.metronome.timeSignature,
      })
      timelineSyncService.notify(snapshot)
    })

    return unsubscribe
  }, [project.timeline.metronome.bpm, project.timeline.metronome.timeSignature])

  const parseSecondsToMMSSms = (s: number) => {
    if (!isFinite(s) || s < 0) return '00:00:000'
    const mm = Math.floor(s / 60)
    const ss = Math.floor(s % 60)
    const ms = Math.floor((s - Math.floor(s)) * 1000)
    const pad = (n: number, l = 2) => String(n).padStart(l, '0')
    return `${pad(mm)}:${pad(ss)}:${String(ms).padStart(3, '0')}`
  }

  const handleConfirmRecording = useCallback((t: { id: string; url: string; offset: number; gain?: number; sourceStartSeconds?: number; sourceEndSeconds?: number; sourceDurationSeconds?: number }) => {
    const title = `Grabación ${new Date().toLocaleTimeString()}`
    const audio = document.createElement('audio')
    audio.src = t.url
    let added = false
    let timeoutId: number | null = null

    const cleanup = () => {
      try { audio.removeAttribute('src'); audio.src = '' } catch {}
      if (timeoutId != null) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
    }

    const onLoaded = () => {
      if (added) return
      added = true
      if (timeoutId != null) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      const duration = isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0
      const clip = projectClipRegistry.addClip({
        trackId: t.id,
        title,
        startTimeSeconds: t.offset,
        endTimeSeconds: t.offset + duration,
        offsetSeconds: t.offset,
        sourceUrl: t.url,
        sourceStartSeconds: t.sourceStartSeconds,
        sourceEndSeconds: t.sourceEndSeconds,
        sourceDurationSeconds: t.sourceDurationSeconds,
      })
      setProject((prev) => ProjectDomainService.upsertClip(prev, {
        trackId: clip.trackId,
        title: clip.title,
        startTimeSeconds: clip.startTimeSeconds,
        endTimeSeconds: clip.endTimeSeconds,
        offsetSeconds: clip.offsetSeconds,
        sourceUrl: clip.sourceUrl,
        sourceStartSeconds: clip.sourceStartSeconds,
        sourceEndSeconds: clip.sourceEndSeconds,
        sourceDurationSeconds: clip.sourceDurationSeconds,
        editState: clip.editState,
      }))
      retainRecordedBlobUrl(t.url)
      setRecordedTracks((prev) => [{ id: t.id, clipId: clip.id, title, url: t.url, offset: t.offset, gain: t.gain ?? 1, enabled: true, duration, offsetText: parseSecondsToMMSSms(t.offset) }, ...prev])
      console.debug('[App] Clip de grabación registrado en el dominio', clip)
      cleanup()
    }

    audio.addEventListener('loadedmetadata', onLoaded, { once: true })
    // fallback: if loadedmetadata doesn't fire, add after timeout (but only once)
    timeoutId = window.setTimeout(() => {
      if (!added) onLoaded()
    }, 800)
  }, [retainRecordedBlobUrl])

  const toggleRecordedEnabled = useCallback((id: string) => {
    setRecordedTracks((prev) => prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)))
  }, [])

  const removeRecordedTrack = useCallback((id: string) => {
    setRecordedTracks((prev) => {
      const removed = prev.find((p) => p.id === id)
      if (removed) {
        releaseRecordedBlobUrl(removed.url)
      }
      return prev.filter((p) => p.id !== id)
    })
  }, [releaseRecordedBlobUrl])

  const hasRecordedTracksOverflow = recordedTracks.length > RECORDED_TRACKS_PAGE_SIZE
  const visibleRecordedTracks = useMemo(() => (
    hasRecordedTracksOverflow
      ? recordedTracks.slice(0, visibleRecordedTracksCount)
      : recordedTracks
  ), [hasRecordedTracksOverflow, recordedTracks, visibleRecordedTracksCount])

  const clipById = useMemo(() => {
    return new Map(project.clips.map((clip) => [clip.id, clip]))
  }, [project.clips])

  const handleSelectRecordedClip = useCallback((clipId: string | undefined) => {
    if (!clipId) return
    setProject((prev) => ProjectDomainService.setClipSelection(prev, clipId, true))
  }, [])

  const handleDeselectRecordedClip = useCallback((clipId: string | undefined) => {
    if (!clipId) return
    setProject((prev) => ProjectDomainService.setClipSelection(prev, clipId, false))
  }, [])

  const handleMoveRecordedClip = useCallback((clipId: string | undefined) => {
    if (!clipId) return
    setProject((prev) => ProjectDomainService.updateClip(prev, clipId, (clip) => ClipService.moveClip(clip, 1)))
  }, [])

  const handleTrimRecordedClip = useCallback((clipId: string | undefined) => {
    if (!clipId) return
    setProject((prev) => ProjectDomainService.updateClip(prev, clipId, (clip) => ClipService.trimClip(clip, 0.5, -0.5)))
  }, [])

  const handleHoverRecordedClip = useCallback((clipId: string | undefined, hovered: boolean) => {
    if (!clipId) return
    setHoveredRecordedClipId(hovered ? clipId : null)
    setProject((prev) => ProjectDomainService.setClipHover(prev, clipId, hovered))
  }, [])

  const handleExportSession = useCallback(() => {
    const payload = JSON.stringify(ProjectDomainService.toSnapshot(project), null, 2)
    const blob = new Blob([payload], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${project.title.replace(/[^a-z0-9_-]/gi, '_') || 'session'}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [project])

  useEffect(() => {
    if (!currentFileUrl) {
      setBeatAnalysis(null)
      return
    }

    let active = true
    fetchBeatAnalysisMock()
      .then((analysis) => {
        if (active) {
          setBeatAnalysis(analysis)
          setProject((prev) => ProjectDomainService.updateSession(prev, {
            timeline: {
              ...prev.timeline,
              durationSeconds: analysis.durationMs / 1000,
              markers: analysis.markers.map((marker, index) => ({
                id: `marker-${index + 1}`,
                type: 'beat' as const,
                timeSeconds: marker.timeMs / 1000,
                label: marker.label,
                measure: marker.measure,
                beatInMeasure: marker.beatInMeasure,
              })),
              metronome: {
                ...prev.timeline.metronome,
                bpm: analysis.bpm ?? prev.timeline.metronome.bpm,
              },
            },
            metadata: {
              ...prev.metadata,
              bpm: (analysis.bpm ?? prev.metadata?.bpm ?? 120).toString(),
            },
          }))
        }
      })
      .catch((error) => {
        console.error('Mock beat analysis failed:', error)
        errorReporter.record('timeline', 'Failed to build timeline contract from beat analysis', error)
        if (active) setBeatAnalysis(null)
      })

    return () => {
      active = false
    }
  }, [currentFileUrl])

  return (
    <div className="h-screen overflow-hidden bg-slate-950 text-slate-100">
  <div className="mx-auto flex h-full w-full max-w-7xl flex-col px-3 py-4 lg:px-4">
    <div id="app" className="flex min-h-0 flex-1 w-full gap-4 overflow-hidden">
        <div className="flex w-[88px] shrink-0 flex-col gap-3">
          <div className="flex flex-col items-center gap-3">
            <button
  type="button"
  onClick={() => setSidebarOverlay(true)}
  aria-label="Abrir menú de canciones"
  className="mt-2 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900/70 text-white"
>
  <Icon icon={Library} size={24} className="text-sky-400" />
</button>

            <RehearsalMonitor
              pitchOffset={pitchOffset}
              setPitchOffset={setPitchOffset}
              clickOn={clickOn}
              setClickOn={setClickOn}
              compact
            />

            <button
              type="button"
              onClick={handleUploadClick}
              aria-label="Nueva canción"
              className="flex w-full flex-col items-center gap-1 rounded-2xl border border-slate-800/80 bg-slate-950/90 px-2 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-200 transition hover:border-slate-600"
            >
              <Icon icon={Plus} size={16} className="text-sky-300" />
              <span>Nueva</span>
            </button>

            <button
              type="button"
              onClick={handleExportSession}
              aria-label="Exportar sesión"
              className="flex w-full flex-col items-center gap-1 rounded-2xl border border-slate-800/80 bg-slate-950/90 px-2 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-200 transition hover:border-slate-600"
            >
              <Icon icon={Download} size={16} className="text-emerald-300" />
              <span>Exportar</span>
            </button>
          </div>
        </div>

        <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
          {isAppLoading ? (
            <div className="shrink-0 rounded-2xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-100">
              <p className="font-semibold">{getLoadingMessage()}</p>
              <p className="mt-1 text-sky-100/80">{isProcessingStem ? 'Esto puede tomar hasta 15s' : 'Preparando interfaz y audio sin bloquear la sesión...'}</p>
            </div>
          ) : null}

          {effectiveFeedbackNotice && (
            <div className="shrink-0 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">{effectiveFeedbackNotice.title}</p>
                  <p className="mt-1 text-amber-100/90">{effectiveFeedbackNotice.message}</p>
                </div>
                <div className="flex items-center gap-2">
                  {effectiveFeedbackNotice.recoveryAction === 'retry-upload' ? (
                    <button
                      type="button"
                      onClick={() => {
                        setFeedbackNotice(null)
                        handleUploadClick()
                      }}
                      className="inline-flex items-center justify-center rounded-lg bg-amber-500/20 px-4 py-2 text-sm font-semibold text-amber-100 transition-colors hover:bg-amber-500/30"
                    >
                      {effectiveFeedbackNotice.recoveryLabel}
                    </button>
                  ) : null}
                  {effectiveFeedbackNotice.recoveryAction === 'retry-playback' ? (
                    <button
                      type="button"
                      onClick={() => {
                        setFeedbackNotice(null)
                        audioControls.play()
                      }}
                      className="inline-flex items-center justify-center rounded-lg bg-amber-500/20 px-4 py-2 text-sm font-semibold text-amber-100 transition-colors hover:bg-amber-500/30"
                    >
                      {effectiveFeedbackNotice.recoveryLabel}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setFeedbackNotice(null)}
                    className="inline-flex items-center justify-center rounded-lg border border-amber-500/30 px-4 py-2 text-sm font-semibold text-amber-100 transition-colors hover:bg-amber-500/10"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}

          <section className="flex min-h-0 flex-1 flex-col rounded-3xl border border-slate-800/80 bg-slate-950/90 p-4 shadow-panel overflow-hidden">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                {WORKSPACE_PANELS.map((panel) => {
                  const isActive = panel.id === activeWorkspacePanel
                  return (
                    <button
                      key={panel.id}
                      type="button"
                      onClick={() => setActiveWorkspacePanel(panel.id)}
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] transition ${
                        isActive
                          ? 'border border-cyan-500/40 bg-cyan-500/10 text-cyan-200'
                          : 'border border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {panel.id === 'waveform' ? <Icon icon={Play} size={14} /> : null}
                      {panel.id === 'stems' ? <Icon icon={Layers3} size={14} /> : null}
                      {panel.id === 'recordings' ? <Icon icon={ListMusic} size={14} /> : null}
                      {panel.id === 'timeline' ? <Icon icon={Clock3} size={14} /> : null}
                      {panel.label}
                    </button>
                  )
                })}
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  aria-label="Panel anterior"
                  onClick={() => handleWorkspacePanelStep('prev')}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-200 transition hover:border-slate-500"
                >
                  <Icon icon={ChevronLeft} size={18} />
                </button>
                <button
                  type="button"
                  aria-label="Siguiente panel"
                  onClick={() => handleWorkspacePanelStep('next')}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-200 transition hover:border-slate-500"
                >
                  <Icon icon={ChevronRight} size={18} />
                </button>
              </div>
            </div>

            <div className="mt-3 min-h-0 flex-1 overflow-hidden">
              <div
                className="flex h-full transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${activeWorkspacePanelIndex * 100}%)` }}
              >
                <div className="min-w-0 w-full shrink-0 overflow-y-auto pr-1">
                  <div className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-3 lg:h-full lg:overflow-hidden">
                    <Waveform 
                      fileUrl={currentFileUrl} 
                      songTitle={songTitle}
                      containerRef={containerRef}
                      controls={audioControls}
                    />
                  </div>
                </div>

                <div className="min-w-0 w-full shrink-0 overflow-y-auto pr-1">
                  <div className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Stems detectados</p>
                        <h3 className="mt-1 text-lg font-semibold text-white">
                          {availableStems.length > 0 ? `${availableStems.length} opción${availableStems.length === 1 ? '' : 'es'}` : 'Esperando procesamiento'}
                        </h3>
                      </div>
                    </div>

                    {availableStems.length > 0 ? (
                      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {availableStems.map((stem) => {
                          const mixState = stemMixState[stem.id] ?? { enabled: true, gain: 1 }
                          return (
                            <div
                              key={stem.id}
                              className="rounded-2xl border border-slate-800/80 bg-slate-950 px-3 py-3 text-left text-slate-300 transition hover:border-slate-600"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-semibold text-white">{stem.label}</p>
                                <button
                                  type="button"
                                  onClick={() => handleStemToggle(stem.id, !mixState.enabled)}
                                  aria-label={mixState.enabled ? `Silenciar ${stem.label}` : `Activar ${stem.label}`}
                                  aria-pressed={mixState.enabled}
                                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition ${
                                    mixState.enabled
                                      ? 'border-emerald-400/60 bg-emerald-500/10'
                                      : 'border-slate-700 bg-slate-900'
                                  }`}
                                >
                                  <span
                                    aria-hidden="true"
                                    className={`h-2.5 w-2.5 rounded-full ${mixState.enabled ? 'bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.85)]' : 'bg-slate-500'}`}
                                  />
                                </button>
                              </div>

                              <div className="mt-3 space-y-2">
                                <label className="block text-[11px] uppercase tracking-[0.22em] text-slate-500" htmlFor={`stem-volume-${stem.id}`}>
                                  Volumen {Math.round(mixState.gain * 100)}%
                                </label>
                                <input
                                  id={`stem-volume-${stem.id}`}
                                  type="range"
                                  min="0"
                                  max="1"
                                  step="0.01"
                                  value={mixState.gain}
                                  onChange={(event) => handleStemVolumeChange(stem.id, Number(event.target.value))}
                                  className="w-full accent-cyan-400"
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="mt-4 rounded-3xl border border-dashed border-slate-700 bg-slate-950/70 px-4 py-5 text-sm text-slate-400">
                        Cargá una canción para ver y elegir sus stems.
                      </div>
                    )}
                  </div>
                </div>

                <div className="min-w-0 w-full shrink-0 overflow-y-auto pr-1">
                  <div className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-4">
                    <div className="mb-4">
                      <Recorder onConfirm={handleConfirmRecording} />
                    </div>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Pistas grabadas</p>
                    {hasRecordedTracksOverflow ? (
                      <div className="mt-3 rounded-2xl border border-slate-800/80 bg-slate-900/50 px-3 py-2 text-xs text-slate-300">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span>Mostrando {visibleRecordedTracks.length} de {recordedTracks.length} pistas</span>
                          <div className="flex items-center gap-2">
                            {visibleRecordedTracks.length < recordedTracks.length ? (
                              <button
                                type="button"
                                onClick={() => setVisibleRecordedTracksCount((prev) => Math.min(prev + RECORDED_TRACKS_PAGE_SIZE, recordedTracks.length))}
                                className="rounded-md border border-slate-700 px-2 py-1 text-[11px] font-semibold text-slate-200"
                              >
                                Cargar más
                              </button>
                            ) : null}
                            {visibleRecordedTracks.length !== recordedTracks.length ? (
                              <button
                                type="button"
                                onClick={() => setVisibleRecordedTracksCount(recordedTracks.length)}
                                className="rounded-md border border-slate-700 px-2 py-1 text-[11px] font-semibold text-slate-200"
                              >
                                Mostrar todo
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setVisibleRecordedTracksCount(RECORDED_TRACKS_PAGE_SIZE)}
                                className="rounded-md border border-slate-700 px-2 py-1 text-[11px] font-semibold text-slate-200"
                              >
                                Colapsar
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : null}
                    <div className="mt-4 space-y-3">
                      {recordedTracks.length === 0 && <p className="text-sm text-slate-400">No hay grabaciones</p>}
                      {visibleRecordedTracks.map((t) => {
                        const clipState = t.clipId ? clipById.get(t.clipId) ?? null : null
                        const isSelected = clipState?.editState === 'selected'
                        const isHovered = clipState?.editState === 'hovered' || hoveredRecordedClipId === t.clipId

                        return (
                          <div
                            key={t.id}
                            onMouseEnter={() => handleHoverRecordedClip(t.clipId, true)}
                            onMouseLeave={() => handleHoverRecordedClip(t.clipId, false)}
                            className={`flex flex-col gap-2 rounded-lg border px-3 py-2 transition ${
                              isSelected
                                ? 'border-sky-500/70 bg-sky-500/10'
                                : isHovered
                                  ? 'border-cyan-500/60 bg-cyan-500/10'
                                  : 'border-slate-800/80'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                {t.enabled ? (
                                  <p className="text-sm font-semibold">{t.title}</p>
                                ) : (
                                  <input
                                    value={t.title}
                                    onChange={(e) => setRecordedTracks((prev) => prev.map((p) => p.id === t.id ? { ...p, title: e.target.value } : p))}
                                    className="w-full rounded-md bg-slate-900/60 px-2 py-1 text-sm text-white"
                                  />
                                )}
                                <p className="mt-1 text-xs text-slate-500">Duración: {t.duration ? parseSecondsToMMSSms(t.duration) : '—'}</p>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleSelectRecordedClip(t.clipId)}
                                    className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1 text-sm font-semibold text-slate-200"
                                  >
                                    <Icon icon={Check} size={16} />
                                    <span>{isSelected ? 'Seleccionado' : 'Seleccionar'}</span>
                                  </button>
                                  {isSelected && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeselectRecordedClip(t.clipId)}
                                      className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1 text-sm font-semibold text-slate-200"
                                    >
                                      <Icon icon={X} size={16} />
                                      <span>Deseleccionar</span>
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => toggleRecordedEnabled(t.id)}
                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold transition ${
                                      t.enabled
                                        ? 'bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30'
                                        : 'bg-rose-500/20 text-rose-200 hover:bg-rose-500/30'
                                    }`}
                                  >
                                    <Icon icon={t.enabled ? Check : X} size={16} strokeWidth={2.5} />
                                    {t.enabled ? 'Incluida' : 'Excluida'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const copyId = `rec-${Date.now()}`
                                      retainRecordedBlobUrl(t.url)
                                      setRecordedTracks((prev) => [{ ...t, id: copyId, title: `${t.title} (copy)` }, ...prev])
                                    }}
                                    className="inline-flex items-center gap-1.5 text-sm text-sky-400 transition-colors hover:text-sky-300"
                                  >
                                    <Icon icon={Copy} size={16} />
                                    <span>Duplicar</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeRecordedTrack(t.id)}
                                    className="inline-flex items-center gap-1.5 text-sm text-rose-400 transition-colors hover:text-rose-300"
                                  >
                                    <Icon icon={Trash2} size={16} />
                                    <span>Eliminar</span>
                                  </button>
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleMoveRecordedClip(t.clipId)}
                                    className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300"
                                  >
                                    Mover +1s
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleTrimRecordedClip(t.clipId)}
                                    className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300"
                                  >
                                    Recortar
                                  </button>
                                </div>
                                <div className="w-48">
                                  <label className="text-[11px] text-slate-400">Vol</label>
                                  <input
                                    type="range"
                                    min={0}
                                    max={2}
                                    step={0.01}
                                    value={t.gain ?? 1}
                                    onChange={(e) => setRecordedTracks((prev) => prev.map((p) => p.id === t.id ? { ...p, gain: Number(e.target.value) } : p))}
                                    className="w-full"
                                  />
                                </div>
                              </div>
                            </div>

                            {(isSelected || isHovered) && (
                              <p className={`text-xs font-medium ${isSelected ? 'text-sky-300' : 'text-cyan-300'}`}>
                                Estado: {clipState?.editState ?? (isSelected ? 'selected' : 'hovered')}
                              </p>
                            )}

                            <div className="flex items-center gap-3">
                              <label className="text-sm text-slate-400">Inicio (MM:SS:MS)</label>
                              {t.enabled ? (
                                <p className="text-sm">{parseSecondsToMMSSms(t.offset ?? 0)}</p>
                              ) : (
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={t.offsetText ?? parseSecondsToMMSSms(t.offset)}
                                  onChange={(e) => {
                                    const value = e.target.value
                                    setRecordedTracks((prev) => prev.map((p) => p.id === t.id ? { ...p, offsetText: value } : p))
                                  }}
                                  onBlur={(e) => {
                                    const value = e.target.value
                                    const parts = value.split(':').map((p) => p.replace(/\D/g, ''))
                                    const mm = Math.min(Number(parts[0] ?? 0), 99)
                                    const ss = Math.min(Number(parts[1] ?? 0), 59)
                                    const ms = Math.min(Number(parts[2] ?? 0), 999)
                                    const seconds = mm * 60 + ss + ms / 1000
                                    setRecordedTracks((prev) => prev.map((p) => p.id === t.id ? { ...p, offset: seconds, offsetText: parseSecondsToMMSSms(seconds) } : p))
                                  }}
                                  className="w-36 rounded-md bg-slate-900/60 px-2 py-1 text-sm text-white"
                                />
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="min-w-0 w-full shrink-0 overflow-y-auto pr-1">
                  <ClickTrackTimeline
                    markers={timelineContract?.markers ?? []}
                    sections={timelineContract?.sections ?? []}
                    jumpRoutes={timelineContract?.jumpRoutes ?? []}
                    bpm={project.timeline.metronome.bpm}
                    timeSignature={project.timeline.metronome.timeSignature}
                    displayOffsetSeconds={project.transport.offsetSeconds}
                    initialCountBeats={project.timeline.initialCountBeats}
                    onMarkerClick={handleSeekFromMarker}
                    onSectionClick={handleSectionNavigation}
                    onAddJumpRoute={handleAddJumpRoute}
                    onRemoveJumpRoute={handleRemoveJumpRoute}
                    onApplyInitialCount={handleApplyInitialCount}
                    onClearInitialCount={handleClearInitialCount}
                  />
                </div>
              </div>
            </div>
          </section>
        </main>
        </div>
      </div>

      {sidebarOverlay ? (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOverlay(false)} />
          <div className="relative z-50 w-80 p-6">
            <Sidebar
              songs={songs}
              selectedId={selectedSongId}
              onSelect={(id) => { handleSongSelect(id); setSidebarOverlay(false) }}
              onUploadClick={() => { handleUploadClick(); setSidebarOverlay(false) }}
              onToggleCollapse={() => { setSidebarOverlay(false) }}
            />
          </div>
        </div>
      ) : null}

      {null}

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}

export default App
