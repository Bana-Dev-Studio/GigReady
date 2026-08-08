import { useRef, useCallback } from 'react'

export function useMetronome(
  audioContext: { current: AudioContext | null },
  clickGainNode: { current: GainNode | null }
) {
  const isEnabled = useRef(false)
  const lastClickTime = useRef(0)
  const bpmRef = useRef(0)
  const clickOscillators = useRef<OscillatorNode[]>([])

  const playClickSound = useCallback((scheduledTime?: number) => {
    if (!audioContext.current || !clickGainNode.current) return

    const ctx = audioContext.current
    const startAt = typeof scheduledTime === 'number' ? scheduledTime : ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.frequency.value = 1000
    osc.type = 'sine'

    gain.gain.setValueAtTime(0.3, startAt)
    gain.gain.exponentialRampToValueAtTime(0.01, startAt + 0.1)

    osc.connect(gain)
    gain.connect(clickGainNode.current)

    osc.start(startAt)
    osc.stop(startAt + 0.1)

    clickOscillators.current.push(osc)
    // Mantener un buffer pequeño de referencias para limpieza
    if (clickOscillators.current.length > 10) {
      clickOscillators.current.shift()
    }
  }, [audioContext, clickGainNode])

  const updateClick = useCallback((currentTime: number) => {
    const bpm = bpmRef.current
    if (!isEnabled.current || bpm === 0) return

    const beatDuration = 60 / bpm

    // Si nunca se ha tocado, forzar un primer click inmediato
    if (lastClickTime.current === 0) {
      lastClickTime.current = currentTime
      playClickSound(currentTime)
      return
    }

    // permitir programar clicks perdidos/pendientes de forma precisa usando el reloj del AudioContext
    let timeSinceLastClick = currentTime - lastClickTime.current

    // lookAhead en el que permitimos programar con antelación (segundos)
    const lookAhead = 0.1 // 100 ms

    // programar repetidos clicks si se han acumulado varios beats
    while (timeSinceLastClick >= beatDuration) {
      const nextClickTime = lastClickTime.current + beatDuration

      const ctxNow = audioContext.current?.currentTime ?? currentTime
      // solo programar si el click cae dentro del horizonte de anticipación
      if (nextClickTime <= ctxNow + lookAhead) {
        playClickSound(nextClickTime)
      }

      lastClickTime.current = nextClickTime
      timeSinceLastClick = currentTime - lastClickTime.current
    }
  }, [playClickSound, audioContext])

  const setEnabled = useCallback((enabled: boolean) => {
    isEnabled.current = enabled
    if (enabled) {
      lastClickTime.current = 0 // Reset para que el primer click suene pronto
    }
  }, [])

  const setBpm = useCallback((bpm: number) => {
    bpmRef.current = bpm
  }, [])

  return {
    updateClick,
    setEnabled,
    setBpm,
  }
}