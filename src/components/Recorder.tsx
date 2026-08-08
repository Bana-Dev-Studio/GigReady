import { useMemo, useRef, useState } from 'react'
import useRecorder from '../hooks/useRecorder'
import { CheckCircle, Download, Mic, Play, Square, Trash2 } from 'lucide-react'
import { Icon } from '../utils/Icon'
import { buildRecordingTimelineContract } from '../services/RecordingTimelineService'

type ConfirmTrack = {
  id: string
  url: string
  offset: number // seconds
  gain?: number
  sourceStartSeconds?: number
  sourceEndSeconds?: number
  sourceDurationSeconds?: number
}

export default function Recorder({ onConfirm }: { onConfirm?: (t: ConfirmTrack) => void }) {
  const {
    isRecording,
    startRecording,
    stopRecording,
    recordedUrl,
    clearRecording,
  } = useRecorder()

  const [startInput, setStartInput] = useState('00:00:000')
  const [sourceEndInput, setSourceEndInput] = useState('00:00:000')
  const audioRef = useRef<HTMLAudioElement | null>(null)

  function parseTime(input: string) {
    // expected MM:SS:MS (ms 3 digits)
    const parts = input.split(':').map((p) => p.replace(/\D/g, ''))
    const mm = Number(parts[0] ?? 0)
    const ss = Number(parts[1] ?? 0)
    const ms = Number(parts[2] ?? 0)
    return mm * 60 + ss + ms / 1000
  }

  const timelineContract = useMemo(() => {
    const timelineStartSeconds = parseTime(startInput)
    const sourceEndSeconds = parseTime(sourceEndInput)
    const sourceDurationSeconds = Math.max(sourceEndSeconds, timelineStartSeconds + 0.001)

    return buildRecordingTimelineContract({
      timelineStartSeconds,
      sourceStartSeconds: timelineStartSeconds,
      sourceEndSeconds,
      sourceDurationSeconds,
    })
  }, [sourceEndInput, startInput])

  const handlePlay = async () => {
    if (!recordedUrl) return
    const audio = audioRef.current
    if (!audio) return
    if (audio.src !== recordedUrl) audio.src = recordedUrl
    const offset = parseTime(startInput)
    const seekAndPlay = () => {
      try { audio.currentTime = Math.max(0, offset) } catch {}
      audio.play().catch((e) => console.warn('Playback failed', e))
    }
    if (isNaN(audio.duration) || audio.duration === 0) {
      audio.addEventListener('loadedmetadata', function onMeta() {
        audio.removeEventListener('loadedmetadata', onMeta)
        seekAndPlay()
      })
    } else {
      seekAndPlay()
    }
  }

  const handleConfirm = () => {
    if (!recordedUrl || !onConfirm) return
    const id = `rec-${Date.now()}`
    const offset = parseTime(startInput)
    onConfirm({
      id,
      url: recordedUrl,
      offset,
      gain: 1,
      sourceStartSeconds: timelineContract.sourceStartSeconds,
      sourceEndSeconds: timelineContract.sourceEndSeconds,
      sourceDurationSeconds: timelineContract.sourceDurationSeconds,
    })
  }

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-slate-950/90 p-6 text-slate-100 shadow-panel">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">Grabadora</p>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
  type="button"
  onClick={isRecording ? stopRecording : () => startRecording().catch(() => {})}
  className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-white transition-colors ${
    isRecording 
      ? 'bg-amber-500 hover:bg-amber-400' 
      : 'bg-indigo-600 hover:bg-indigo-500'
  } disabled:cursor-not-allowed disabled:opacity-50`}
>
  <div className={isRecording ? "animate-pulse" : ""}>
  <Icon 
    icon={isRecording ? Square : Mic} 
    size={16} 
    strokeWidth={isRecording ? 3 : 2} 
  />
</div>
  <span>{isRecording ? 'Detener' : 'Grabar'}</span>
</button>
        <button
  type="button"
  onClick={handlePlay}
  disabled={!recordedUrl}
  className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
>
  <Icon icon={Play} size={16} fill="currentColor" />
  <span>Reproducir</span>
</button>
        <button
  type="button"
  onClick={clearRecording}
  disabled={!recordedUrl}
  className="inline-flex items-center gap-2 rounded-md bg-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
>
  <Icon icon={Trash2} size={16} />
  <span>Borrar</span>
</button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="text-sm text-slate-400">Inicio (MM:SS:MS)</label>
        <input
          type="text"
          value={startInput}
          onChange={(e) => setStartInput(e.target.value)}
          className="w-36 rounded-md bg-slate-900/60 px-2 py-1 text-sm text-white"
        />
        <label className="text-sm text-slate-400">Fin (MM:SS:MS)</label>
        <input
          type="text"
          value={sourceEndInput}
          onChange={(e) => setSourceEndInput(e.target.value)}
          className="w-36 rounded-md bg-slate-900/60 px-2 py-1 text-sm text-white"
        />
        <span className="text-sm text-slate-400">
          {timelineContract.durationSeconds.toFixed(3)}s · {timelineContract.timelineStartSeconds.toFixed(3)}s → {timelineContract.timelineEndSeconds.toFixed(3)}s
        </span>
        <button
  type="button"
  onClick={handleConfirm}
  disabled={!recordedUrl}
  className="ml-auto inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
>
  <Icon icon={CheckCircle} size={16} />
  <span>Confirmar como track</span>
</button>
      </div>

      <div className="mt-3">
  {recordedUrl && (
    <a 
      href={recordedUrl} 
      download="grabacion.webm" 
      className="inline-flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
    >
      <Icon icon={Download} size={16} />
      Descargar archivo
    </a>
  )}
</div>

      <audio ref={audioRef} hidden />
    </div>
  )
}
