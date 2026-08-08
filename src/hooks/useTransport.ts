import { useState, useRef, useCallback } from 'react'
import type { AudioEngineState } from '../types'

export function useTransport(
  audioContext: React.MutableRefObject<AudioContext | null>,
  decodedBuffer: React.MutableRefObject<AudioBuffer | null>,
  createAudioSource: () => AudioBufferSourceNode | null,
  resetAudioSource: (ref: React.MutableRefObject<AudioBufferSourceNode | null>) => void,
  onTick: (currentTime: number) => void,
  waveSurfer: React.MutableRefObject<any | null>
) {
  const [state, setState] = useState<AudioEngineState>({
    isReady: false, isPlaying: false, currentTime: 0, duration: 0,
    loadProgress: 0,
  })

  const isPlayingRef = useRef(false)
  const playbackStartTime = useRef(0)
  const playbackOffsetRef = useRef(0)
  const durationRef = useRef(0)
  const currentTimeRef = useRef(0)
  const rafId = useRef<number | null>(null)
  const audioBufferSource = useRef<AudioBufferSourceNode | null>(null)

  const cancelTimeTracking = useCallback(() => {
    if (rafId.current !== null) cancelAnimationFrame(rafId.current)
    rafId.current = null
  }, [])

  const trackTime = useCallback(() => {
    if (!audioContext.current || !isPlayingRef.current) return
    const elapsed = audioContext.current.currentTime - playbackStartTime.current
    const currentTime = Math.min(playbackOffsetRef.current + elapsed, durationRef.current)
    
    currentTimeRef.current = currentTime
    setState((prev: any) => ({ ...prev, currentTime }))
    onTick(currentTime)

    if (currentTime >= durationRef.current) {
      isPlayingRef.current = false
      setState((prev: any) => ({ ...prev, isPlaying: false }))
      cancelTimeTracking()
      return
    }
    rafId.current = requestAnimationFrame(trackTime)
  }, [audioContext, onTick, cancelTimeTracking])

  const play = useCallback(() => {
    if (!audioContext.current || !decodedBuffer.current) return
    if (audioContext.current.state === 'suspended') audioContext.current.resume()

    resetAudioSource(audioBufferSource)
    const source = createAudioSource()
    if (!source) return

    audioBufferSource.current = source
    playbackStartTime.current = audioContext.current.currentTime
    source.start(0, playbackOffsetRef.current)

    isPlayingRef.current = true
    setState((prev: any) => ({ ...prev, isPlaying: true }))
    cancelTimeTracking()
    rafId.current = requestAnimationFrame(trackTime)
  }, [audioContext, decodedBuffer, createAudioSource, resetAudioSource, trackTime, cancelTimeTracking])

  const pause = useCallback(() => {
    resetAudioSource(audioBufferSource)
    cancelTimeTracking()
    playbackOffsetRef.current = currentTimeRef.current
    isPlayingRef.current = false
    setState((prev: any) => ({ ...prev, isPlaying: false }))
  }, [cancelTimeTracking, resetAudioSource])

  const seek = useCallback((time: number) => {
    const clampedTime = Math.max(0, Math.min(time, durationRef.current))
    playbackOffsetRef.current = clampedTime
    currentTimeRef.current = clampedTime
    setState((prev: any) => ({ ...prev, currentTime: clampedTime }))
    
    if (waveSurfer.current) waveSurfer.current.setTime(clampedTime)
    if (isPlayingRef.current) play()
  }, [play, waveSurfer])

  return { state, setState, play, pause, seek, durationRef }
}