import { useRef, useCallback } from 'react'
import { SoundTouchNode } from '@soundtouchjs/audio-worklet'
import type { SoundTouchNode as SoundTouchNodeType } from '../types'

export function useAudioNodes() {
  const audioContext = useRef<AudioContext | null>(null)
  const soundTouchNode = useRef<SoundTouchNodeType | null>(null)
  const outputGainNode = useRef<GainNode | null>(null)
  const clickGainNode = useRef<GainNode | null>(null)
  const isAudioWorkletRegistered = useRef(false)

  const initNodes = useCallback(async () => {
    if (audioContext.current) return

    // Soporte para navegadores viejos (webkit) si fuera necesario
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    const ctx = new AudioContextClass()
    audioContext.current = ctx

    const mainGain = ctx.createGain()
    mainGain.gain.value = 0.8
    mainGain.connect(ctx.destination)
    outputGainNode.current = mainGain

    const clickGain = ctx.createGain()
    clickGain.gain.value = 0.3
    clickGain.connect(mainGain)
    clickGainNode.current = clickGain

    if (!isAudioWorkletRegistered.current) {
      try {
        await SoundTouchNode.register(ctx, '/soundtouch-processor.js')
        isAudioWorkletRegistered.current = true
      } catch (error) {
        console.error('Error al registrar SoundTouch:', error)
      }
    }
  }, [])

  return {
    audioContext,
    soundTouchNode,
    outputGainNode,
    clickGainNode,
    initNodes,
    isAudioWorkletRegistered
  }
}