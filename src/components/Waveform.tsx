import { memo, useEffect, useMemo, useRef, useState } from 'react'
import type { WaveformProps, PlayerState } from '../types'
import { usePlayerStore } from '../store/usePlayerStore'
import { Pause, Play, RotateCcw, RotateCw } from 'lucide-react'
import { Icon } from '../utils/Icon'
import { errorReporter } from '../services/ErrorReporter'
import { useShallow } from 'zustand/react/shallow'
function formatTime(value: number) {
  const minutes = Math.floor(value / 60)
  const seconds = Math.floor(value % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function Waveform({ fileUrl, songTitle, containerRef, controls }: WaveformProps) {
  const renderCount = useRef(0)
  const [volume, setVolume] = useState(0.8)
  const { isPlaying, isReady, duration, currentTime, loadProgress } = usePlayerStore(useShallow((state: PlayerState) => ({
    isPlaying: state.isPlaying,
    isReady: state.isReady,
    duration: state.duration,
    currentTime: state.currentTime,
    loadProgress: state.loadProgress,
  })))
  const playbackLabel = useMemo(() => {
    if (!fileUrl) return 'No cargado'
    if (!isReady) return 'Cargando'
    return isPlaying ? 'Reproduciendo' : 'Pausado'
  }, [fileUrl, isReady, isPlaying])

  const handleToggle = () => {
    if (isPlaying) {
      controls.pause()
    } else {
      controls.play()
    }
  }

  const handleJump = (direction: 'back' | 'forward') => {
    const step = 5
    const target = Math.max(0, Math.min(duration, currentTime + (direction === 'forward' ? step : -step)))
    controls.seek(target)
  }

  const handleVolumeChange = (value: number) => {
    setVolume(value)
    controls.setVolume(value)
  }

  useEffect(() => {
    renderCount.current += 1
    errorReporter.recordMetric('ui-render', 'waveform-render', renderCount.current, {
      fileUrl: fileUrl ? 'loaded' : 'empty',
      isReady,
      isPlaying,
      duration,
    })
  })

  return (
    <section className="grid h-full min-h-0 gap-3 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-stretch">
      <div className="flex min-w-0 min-h-0 flex-col rounded-3xl bg-slate-950/80 p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-white">{songTitle}</h2>
            <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-400">{playbackLabel}</p>
          </div>
          <span className="inline-flex items-center self-start rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-300">
            {isPlaying ? 'Reproduciendo' : 'Pausado'}
          </span>
        </div>

        <div className="mt-3 flex min-h-0 flex-1 rounded-3xl bg-slate-950 p-3">
          <div ref={containerRef} className="min-h-[112px] w-full rounded-3xl bg-slate-950 lg:min-h-[132px]" />
          {fileUrl && !isReady && (
            <div className="mt-3 flex items-center gap-3 text-sm text-slate-400">
              <span className="inline-flex h-5 w-5 animate-spin items-center justify-center rounded-full border-2 border-slate-600 border-t-slate-300" />
              <span>Cargando forma de onda ({Math.round(loadProgress)}%)</span>
            </div>
          )}
          {!fileUrl && (
            <div className="mt-3 flex h-28 items-center justify-center rounded-3xl border border-dashed border-slate-700 text-slate-500 lg:h-32">
              Selecciona una canción para cargar la forma de onda
            </div>
          )}
        </div>
      </div>

      <aside className="grid content-start gap-3 rounded-3xl bg-slate-950/80 p-3 lg:h-full">
        <button
          type="button"
          onClick={handleToggle}
          disabled={!fileUrl}
          aria-label={isPlaying ? 'Pausar reproducción' : 'Iniciar reproducción'}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-indigo-500 px-4 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon icon={isPlaying ? Pause : Play} size={20} strokeWidth={2.5} />
          <span>{isPlaying ? 'Pausar' : 'Play'}</span>
        </button>

        <div className="rounded-2xl bg-slate-950 p-3 text-sm text-slate-300">
          <span className="font-semibold text-slate-100">Tiempo</span>
          <p className="mt-1 text-base font-semibold text-white">{formatTime(currentTime)}</p>
          <p className="text-xs text-slate-400">/ {formatTime(duration)}</p>
        </div>

        <div className="rounded-2xl bg-slate-950 p-3">
          <label htmlFor="volume-control" className="text-sm font-semibold text-slate-100">Volumen</label>
          <input
            id="volume-control"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(event) => handleVolumeChange(Number(event.target.value))}
            aria-label="Control de volumen de reproducción"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(volume * 100)}
            aria-valuetext={`${Math.round(volume * 100)} por ciento`}
            className="mt-3 w-full accent-cyan-400"
          />
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>0%</span>
            <span>{Math.round(volume * 100)}%</span>
            <span>100%</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleJump('back')}
            disabled={!fileUrl}
            aria-label="Retroceder 5 segundos"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon icon={RotateCcw} size={16} />
            <span>-5s</span>
          </button>
          <button
            type="button"
            onClick={() => handleJump('forward')}
            disabled={!fileUrl}
            aria-label="Avanzar 5 segundos"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>+5s</span>
            <Icon icon={RotateCw} size={16} />
          </button>
        </div>
      </aside>
    </section>
  )
}

export default memo(Waveform)
