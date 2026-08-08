import { useEffect, useRef, useCallback, useMemo, useState } from 'react'
import WaveSurfer from 'wavesurfer.js'
import type { AudioEngineControls, PlayerState } from '../types'
import type { Stem } from '../utils/stemApi'
import { usePlayerStore } from '../store/usePlayerStore'
import { audioService } from '../services/AudioService'
import { useTrackLoader } from './useTrackLoader'
import { useMultiTrackLoader } from './useMultitrackLoader'
import { useStemMixerLoader } from './useStemMixerLoader'
import { buildFeedbackNoticeWithTelemetry } from '../services/FeedbackMessages'
import { errorReporter } from '../services/ErrorReporter'
import { playbackEventBus } from '../services/PlaybackEventBus'

export function useAudioEngine(
  fileUrl: string | null, 
  clickTrackUrl: string | null, 
  recordedTracks?: Array<{ id: string; url: string; offset: number; gain?: number; enabled?: boolean }>,
  stems?: Array<Pick<Stem, 'id' | 'label' | 'mimeType' | 'durationMs'> & { audioUrl?: string; enabled?: boolean; gain?: number }>
) {
  const setIsPlayingStore = usePlayerStore((state: PlayerState) => state.setIsPlaying)
  const setCurrentTimeStore = usePlayerStore((state: PlayerState) => state.setCurrentTime)
  const setDurationStore = usePlayerStore((state: PlayerState) => state.setDuration)
  const setIsReadyStore = usePlayerStore((state: PlayerState) => state.setIsReady)
  const setLoadProgress = usePlayerStore((state: PlayerState) => state.setLoadProgress)
  const setPlaybackModeStore = usePlayerStore((state: PlayerState) => state.setPlaybackMode)
  const isPlaying = usePlayerStore((state: PlayerState) => state.isPlaying)
  const transportOffsetSeconds = usePlayerStore((state: PlayerState) => state.transport.offsetSeconds)
  
  const containerRef = useRef<HTMLDivElement | null>(null)
  const waveSurfer = useRef<WaveSurfer | null>(null)
  
  const { audioBuffer: clickBufferData } = useTrackLoader(clickTrackUrl)
  const { recordedBuffers } = useMultiTrackLoader(recordedTracks)
  const { loadedStems } = useStemMixerLoader(stems)
  const hasLoadedStemTracks = loadedStems.some((stem) => Boolean(stem.buffer))
  const [feedbackNotice, setFeedbackNotice] = useState<ReturnType<typeof buildFeedbackNoticeWithTelemetry> | null>(null)
  // Estado del flujo
  const clickEnabledRef = useRef(false)
  const stemTrackStateRef = useRef<Map<string, { enabled: boolean; gain: number }>>(new Map())
  const playbackStartTime = useRef(0)
  const playbackOffset = useRef(0)
  const durationRef = useRef(0)
  const currentTimeRef = useRef(0)
  const rafId = useRef<number | null>(null)
  const isPlayingRef = useRef(false)
  const waveLoadStartedAt = useRef<number | null>(null)
  const activeWaveFileUrlRef = useRef<string | null>(null)
  const replacePlaybackSourceRef = useRef<(startTime: number) => boolean>(() => false)
  const jumpRuleDefinitionsRef = useRef<Array<{ id: string; triggerTimeSeconds: number; targetTimeSeconds: number; maxJumps: number }>>([])
  const jumpRulesRef = useRef<Array<{ id: string; triggerTimeSeconds: number; targetTimeSeconds: number; remainingJumps: number }>>([])
  const previousTickTimeRef = useRef(0)
const { audioBuffer: mainTrackBuffer } = useTrackLoader(fileUrl)

  const resetAutomationCounters = useCallback(() => {
    jumpRulesRef.current = jumpRuleDefinitionsRef.current
      .map((rule) => ({
        id: rule.id,
        triggerTimeSeconds: rule.triggerTimeSeconds,
        targetTimeSeconds: rule.targetTimeSeconds,
        remainingJumps: Math.max(0, Math.floor(rule.maxJumps)),
      }))
      .filter((rule) => rule.remainingJumps > 0)
      .sort((left, right) => left.triggerTimeSeconds - right.triggerTimeSeconds)
  }, [])

  const timelineToWaveformTime = useCallback((timelineTime: number) => {
    return Math.max(0, timelineTime - transportOffsetSeconds)
  }, [transportOffsetSeconds])

  const waveformToTimelineTime = useCallback((waveformTime: number) => {
    return waveformTime + transportOffsetSeconds
  }, [transportOffsetSeconds])

  const syncPlaybackClock = useCallback((time: number) => {
    currentTimeRef.current = time
    playbackOffset.current = time
    setCurrentTimeStore(time)

    if (waveSurfer.current) {
      waveSurfer.current.setTime(timelineToWaveformTime(time))
    }
  }, [setCurrentTimeStore, timelineToWaveformTime])
  const cancelTimeTracking = useCallback(() => {
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current)
      rafId.current = null
    }
  }, [])

  const trackTime = useCallback(() => {
    const ctx = audioService.context
    if (!ctx || !isPlayingRef.current) return

    const elapsed = ctx.currentTime - playbackStartTime.current
    const currentTime = Math.min(playbackOffset.current + elapsed, durationRef.current)
    const previousTime = previousTickTimeRef.current
    currentTimeRef.current = currentTime
    previousTickTimeRef.current = currentTime

    const nextJumpRuleIndex = jumpRulesRef.current.findIndex((jumpRule) => (
      jumpRule.remainingJumps > 0 && previousTime < jumpRule.triggerTimeSeconds && currentTime >= jumpRule.triggerTimeSeconds
    ))
    if (nextJumpRuleIndex >= 0) {
      const jumpRule = jumpRulesRef.current[nextJumpRuleIndex]
      jumpRulesRef.current[nextJumpRuleIndex] = {
        ...jumpRule,
        remainingJumps: jumpRule.remainingJumps - 1,
      }
      replacePlaybackSourceRef.current(jumpRule.targetTimeSeconds)
      return
    }

    if (currentTime >= durationRef.current) {
      isPlayingRef.current = false
      const finalTime = durationRef.current
      setIsPlayingStore(false)
      setPlaybackModeStore('paused')
      syncPlaybackClock(finalTime)
      cancelTimeTracking()
      return
    }

    setCurrentTimeStore(currentTime)
    if (waveSurfer.current) {
      waveSurfer.current.setTime(timelineToWaveformTime(currentTime))
    }

    rafId.current = requestAnimationFrame(trackTime)
  }, [setIsPlayingStore, setPlaybackModeStore, setCurrentTimeStore, syncPlaybackClock, cancelTimeTracking, timelineToWaveformTime]) 

  const startTimeTracking = useCallback(() => {
    cancelTimeTracking()
    rafId.current = requestAnimationFrame(trackTime)
  }, [cancelTimeTracking, trackTime])

  /**
   * Envía las pistas limpias y separadas al mezclador de hardware
   */
  const replacePlaybackSource = useCallback((startTime: number) => {
  try {
    cancelTimeTracking()

    // 🚀 S9 & S10: Usamos las variables que ahora llegan desde los hooks
    // mainTrackBuffer viene de useTrackLoader
    // recordedBuffers viene de useMultiTrackLoader
    const stemTracks = loadedStems
      .filter((stem) => Boolean(stem.buffer))
      .map((stem) => {
        const state = stemTrackStateRef.current.get(stem.id) ?? { enabled: stem.enabled ?? true, gain: stem.gain ?? 1 }
        return {
          buffer: stem.buffer!,
          offset: transportOffsetSeconds,
          enabled: state.enabled,
          gain: state.gain,
          applyPitch: true,
        }
      })

    // Cuando hay stems, el motor funciona en modo stems-only para evitar duplicar audio.
    const success = audioService.syncPlayback(startTime, {
      mainBuffer: stemTracks.length > 0 ? null : mainTrackBuffer,
      clickBuffer: clickBufferData, // 🚀 También usamos el buffer del loader de click
      isClickEnabled: clickEnabledRef.current, 
      primaryTrackOffset: transportOffsetSeconds,
      recordedTracks: recordedBuffers.map(rb => ({
        buffer: rb.buffer,
        offset: rb.offset ?? 0,
        enabled: rb.enabled
      })),
      stemTracks,
    })

    if (!success) return false

    const ctx = audioService.context
    if (ctx) {
      playbackStartTime.current = ctx.currentTime
      playbackOffset.current = startTime
      previousTickTimeRef.current = startTime
      isPlayingRef.current = true
      setIsPlayingStore(true)
      setPlaybackModeStore('playing')
      startTimeTracking()
      errorReporter.recordMetric('audio-playback', 'start', 1, { source: 'audio-engine', time: startTime })
      errorReporter.recordMetric('audio-playback', 'source-replaced', 1, {
        hasClick: clickEnabledRef.current,
        recordedTracks: recordedBuffers.length,
      })
    }

    return true
  } catch (error) {
    console.error('Error en replacePlaybackSource:', error)
    return false
  }
}, [
  mainTrackBuffer,       // Dependencia actualizada
  clickBufferData,       // Dependencia actualizada
  recordedBuffers,       // Dependencia actualizada
  cancelTimeTracking, 
  startTimeTracking, 
  loadedStems,
  setIsPlayingStore,
  setPlaybackModeStore,
  transportOffsetSeconds,
])

  useEffect(() => {
    replacePlaybackSourceRef.current = replacePlaybackSource
  }, [replacePlaybackSource])

  const getCurrentPlaybackTime = useCallback(() => {
    const ctx = audioService.context
    if (!ctx || !isPlayingRef.current) return playbackOffset.current
    return Math.min(
      durationRef.current,
      playbackOffset.current + (ctx.currentTime - playbackStartTime.current)
    )
  }, [])

  const syncWaveformLayout = useCallback(() => {
    const container = containerRef.current
    const instance = waveSurfer.current
    if (!container || !instance || container.clientWidth === 0) return

    const nextHeight = container.clientWidth < 900 ? 112 : 132
    instance.setOptions({ height: nextHeight })
  }, [])

  useEffect(() => {
  if ((mainTrackBuffer || hasLoadedStemTracks) && isPlayingRef.current && clickEnabledRef.current) {
    replacePlaybackSource(getCurrentPlaybackTime())
  }
}, [clickBufferData, hasLoadedStemTracks, mainTrackBuffer, getCurrentPlaybackTime, replacePlaybackSource])

  useEffect(() => {
    if ((mainTrackBuffer || hasLoadedStemTracks) && isPlayingRef.current) {
      replacePlaybackSource(getCurrentPlaybackTime())
    }
  }, [recordedBuffers, loadedStems, hasLoadedStemTracks, mainTrackBuffer, getCurrentPlaybackTime, replacePlaybackSource])

  useEffect(() => {
    isPlayingRef.current = isPlaying
  }, [isPlaying])

  // Inicialización de WaveSurfer visual
  // 🚀 S9 - Simplificado al extremo: WaveSurfer ahora solo renderiza el contenedor visual
  useEffect(() => {
    if (!containerRef.current) return

    waveSurfer.current = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#334155',
      progressColor: '#22d3ee',
      cursorColor: '#38bdf8',
      cursorWidth: 2,
      barWidth: 2,
      barRadius: 2,
      height: 140,
      normalize: true,
      backend: 'WebAudio',
      hideScrollbar: true,
      interact: true,
    })
    waveSurfer.current.on('loading', (percent) => {
      setLoadProgress(percent)
      if (percent === 0 || percent === 100 || percent % 25 === 0) {
        errorReporter.recordMetric('audio-load', 'waveform-loading-progress', percent, {
          fileUrl,
        })
      }
    })
    waveSurfer.current.on('ready', () => {
      setIsReadyStore(true)
      setPlaybackModeStore('idle')
      setLoadProgress(100)
      errorReporter.recordMetric('audio-load', 'waveform-ready', 1, {
        fileUrl,
      })
      if (waveLoadStartedAt.current !== null) {
        errorReporter.recordMetric('audio-load', 'waveform-ready-duration', performance.now() - waveLoadStartedAt.current, {
          fileUrl,
        })
        waveLoadStartedAt.current = null
      }
    })
    waveSurfer.current.on('error', (error) => {
      if (error instanceof DOMException && error.name === 'AbortError') {
        errorReporter.recordMetric('audio-load', 'waveform-load-aborted', 1, {
          fileUrl: activeWaveFileUrlRef.current,
        })
        return
      }
      errorReporter.record('audio-load', 'WaveSurfer failed to load waveform', {
        fileUrl: activeWaveFileUrlRef.current,
        error,
      })
    })

    syncWaveformLayout()

    return () => {
      waveSurfer.current?.destroy()
      waveSurfer.current = null
    }
  }, [setLoadProgress, setPlaybackModeStore, setIsReadyStore, syncWaveformLayout])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const resizeObserver = new ResizeObserver(() => {
      syncWaveformLayout()
    })

    resizeObserver.observe(container)
    return () => resizeObserver.disconnect()
  }, [syncWaveformLayout])

  useEffect(() => {
    if (!waveSurfer.current) return

    if (!fileUrl || !mainTrackBuffer) {
      waveSurfer.current.empty()
      audioService.stopAll()
      durationRef.current = 0
      currentTimeRef.current = 0
      setIsReadyStore(false)
      syncPlaybackClock(0)
      setDurationStore(0)
      errorReporter.recordMetric('audio-load', 'waveform-reset', 1, {
        hasFileUrl: Boolean(fileUrl),
        hasMainTrackBuffer: Boolean(mainTrackBuffer),
      })
      return
    }

    activeWaveFileUrlRef.current = fileUrl
    waveLoadStartedAt.current = performance.now()
    errorReporter.recordMetric('audio-load', 'waveform-load-requested', 1, {
      fileUrl,
    })
    void waveSurfer.current.load(fileUrl).catch((error) => {
      if (error instanceof DOMException && error.name === 'AbortError') {
        errorReporter.recordMetric('audio-load', 'waveform-load-aborted', 1, {
          fileUrl,
        })
        return
      }

      errorReporter.record('audio-load', 'WaveSurfer load promise rejected', {
        fileUrl,
        error,
      })
    })
    syncWaveformLayout()

    const stemDuration = loadedStems.reduce((max, stem) => {
      const nextDuration = stem.buffer?.duration ?? 0
      return Math.max(max, nextDuration)
    }, 0)
    const duration = (stemDuration > 0 ? stemDuration : mainTrackBuffer.duration) + transportOffsetSeconds
    durationRef.current = duration
    setDurationStore(duration)
    setIsReadyStore(true)
    setLoadProgress(100)
  }, [fileUrl, loadedStems, mainTrackBuffer, setDurationStore, setIsReadyStore, setLoadProgress, syncPlaybackClock, syncWaveformLayout, transportOffsetSeconds])

  const play = useCallback(async () => {
  if (!mainTrackBuffer && !hasLoadedStemTracks) return

  try {
    await audioService.init()
    await audioService.resume()

    if (playbackOffset.current >= durationRef.current && durationRef.current > 0) {
      playbackOffset.current = 0
      currentTimeRef.current = 0
      setCurrentTimeStore(0)
    }

    if (playbackOffset.current <= 0.0001) {
      resetAutomationCounters()
    }

    // Le pedimos al servicio que reproduzca el buffer principal
    const started = replacePlaybackSource(playbackOffset.current)
    if (!started) {
      playbackEventBus.publishState('playback:error', { reason: 'start-failed', source: 'audio-engine' })
      errorReporter.record('audio-playback', 'Playback start failed without throwing')
      setFeedbackNotice(buildFeedbackNoticeWithTelemetry('audio-playback', 'Playback start failed without throwing'))
    } else {
      playbackEventBus.publishState('playback:started', { time: playbackOffset.current, source: 'audio-engine' })
      errorReporter.recordMetric('audio-playback', 'started-event-published', 1, {
        playbackOffset: playbackOffset.current,
      })
      setFeedbackNotice(null)
    }
  } catch (error) {
    console.error('Play error:', error)
    errorReporter.record('audio-playback', 'Playback start failed', error)
    setFeedbackNotice(buildFeedbackNoticeWithTelemetry('audio-playback', 'Playback start failed'))
  }
}, [hasLoadedStemTracks, mainTrackBuffer, replacePlaybackSource, resetAutomationCounters, setCurrentTimeStore])

  const pause = useCallback(() => {
    audioService.stopAll()
    cancelTimeTracking()
    playbackOffset.current = currentTimeRef.current
    isPlayingRef.current = false
    setIsPlayingStore(false)
    setPlaybackModeStore('paused')
    errorReporter.recordMetric('audio-playback', 'pause', 1, {
      time: currentTimeRef.current,
    })
    playbackEventBus.publishState('playback:paused', { time: currentTimeRef.current, source: 'audio-engine' })
  }, [cancelTimeTracking, setIsPlayingStore, setPlaybackModeStore])

  const seek = useCallback(async (time: number) => {
    if (!waveSurfer.current || durationRef.current === 0) return

    const clampedTime = Math.max(0, Math.min(time, durationRef.current))
    errorReporter.recordMetric('audio-playback', 'seek', clampedTime, {
      requestedTime: time,
    })
    syncPlaybackClock(clampedTime)
    resetAutomationCounters()

    if (isPlayingRef.current) {
      replacePlaybackSource(clampedTime)
    }
  }, [replacePlaybackSource, resetAutomationCounters, syncPlaybackClock])

  const setJumpRules = useCallback((rules: Array<{ id: string; triggerTimeSeconds: number; targetTimeSeconds: number; maxJumps: number }>) => {
    jumpRuleDefinitionsRef.current = rules
      .map((rule) => ({
        id: rule.id,
        triggerTimeSeconds: rule.triggerTimeSeconds,
        targetTimeSeconds: rule.targetTimeSeconds,
        maxJumps: Math.max(0, Math.floor(rule.maxJumps)),
      }))
      .filter((rule) => rule.maxJumps > 0)
      .sort((left, right) => left.triggerTimeSeconds - right.triggerTimeSeconds)
    resetAutomationCounters()
  }, [resetAutomationCounters])

  const setVolume = useCallback((volume: number) => {
    audioService.setVolume(volume)
    waveSurfer.current?.setVolume(volume)
  }, [])

  const setClickVolume = useCallback((volume: number) => {
    audioService.setClickVolume(volume)
  }, [])

  const handleSetClickTrackEnabled = useCallback((enabled: boolean) => {
    clickEnabledRef.current = enabled
    if (isPlayingRef.current) {
      replacePlaybackSource(getCurrentPlaybackTime())
    }
  }, [getCurrentPlaybackTime, replacePlaybackSource]) 

  const setStemTrackState = useCallback((stemId: string, enabled: boolean, gain?: number) => {
    const nextState = stemTrackStateRef.current.get(stemId) ?? { enabled: true, gain: 1 }
    const merged = {
      enabled: typeof enabled === 'boolean' ? enabled : nextState.enabled,
      gain: typeof gain === 'number' ? gain : nextState.gain,
    }
    stemTrackStateRef.current.set(stemId, merged)
    if (isPlayingRef.current) {
      replacePlaybackSource(getCurrentPlaybackTime())
    }
  }, [getCurrentPlaybackTime, replacePlaybackSource])

  const controls: AudioEngineControls = useMemo(() => ({
    play,
    pause,
    seek,
    setJumpRules,
    setVolume,
    setClickVolume,
    setPitch: (semitones: number) => {
      audioService.setPitch(semitones)
      if (isPlayingRef.current) {
        replacePlaybackSource(getCurrentPlaybackTime())
      }
    },
    setClickTrackEnabled: handleSetClickTrackEnabled,
    setStemTrackState,
  }), [play, pause, seek, setJumpRules, setVolume, setClickVolume, getCurrentPlaybackTime, handleSetClickTrackEnabled, replacePlaybackSource, setStemTrackState])

  useEffect(() => {
    return () => {
      console.debug('[useAudioEngine] Limpiando recursos del motor de audio al desmontar.');
      audioService.dispose();
    }
  }, [])
  // Clicks interactivos en la forma de onda
  useEffect(() => {
    const ws = waveSurfer.current
    if (!ws) return

    const handleInteraction = (newTime: number) => {
      const nextTimelineTime = waveformToTimelineTime(newTime)
      const clampedTime = Math.max(0, Math.min(nextTimelineTime, durationRef.current))
      syncPlaybackClock(clampedTime)
      resetAutomationCounters()

      if (isPlayingRef.current) {
        replacePlaybackSource(clampedTime)
      }
    }

    ws.on('interaction', handleInteraction)
    return () => { ws.un('interaction', handleInteraction) }
  }, [replacePlaybackSource, resetAutomationCounters, syncPlaybackClock, waveformToTimelineTime])

  return {
    containerRef,
    controls,
    feedbackNotice,
  }
}