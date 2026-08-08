import { memo, useEffect, useRef } from 'react'
import { Minus, Plus, Timer } from 'lucide-react'
import type { RehearsalProps } from '../types'
import { Icon } from '../utils/Icon'
import { errorReporter } from '../services/ErrorReporter'

const MIN_PITCH_SEMITONES = -6
const MAX_PITCH_SEMITONES = 6

function RehearsalMonitor({
  pitchOffset,
  setPitchOffset,
  clickOn,
  setClickOn,
  compact = false,
}: RehearsalProps) {
  const renderCount = useRef(0)
  const ledOn = clickOn

  useEffect(() => {
    renderCount.current += 1
    errorReporter.recordMetric('ui-render', 'rehearsal-render', renderCount.current, {
      clickOn,
      pitchOffset,
    })
  })

  const applyPitchDelta = (delta: number) => {
    const nextValue = Math.max(MIN_PITCH_SEMITONES, Math.min(MAX_PITCH_SEMITONES, pitchOffset + delta))
    setPitchOffset(nextValue)
  }

  if (compact) {
    return (
      <section className="rounded-3xl border border-slate-800/80 bg-slate-950/90 p-2 shadow-panel">
        <div className="flex flex-col gap-2">
          <div className="rounded-2xl bg-slate-950/80 p-2">
            <p className="text-center text-[10px] uppercase tracking-[0.24em] text-slate-500">Pitch</p>
            <div className="mt-2 flex flex-col items-center gap-1">
              <button
                type="button"
                onClick={() => applyPitchDelta(1)}
                disabled={pitchOffset >= MAX_PITCH_SEMITONES}
                aria-label="Subir un semitono"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-200 disabled:opacity-40"
              >
                <Icon icon={Plus} size={14} />
              </button>
              <div className="min-w-[40px] rounded-lg bg-slate-900 px-2 py-1 text-center">
                <p className="text-sm font-semibold text-white">{pitchOffset}</p>
              </div>
              <button
                type="button"
                onClick={() => applyPitchDelta(-1)}
                disabled={pitchOffset <= MIN_PITCH_SEMITONES}
                aria-label="Bajar un semitono"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-200 disabled:opacity-40"
              >
                <Icon icon={Minus} size={14} />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setClickOn(!clickOn)}
            aria-pressed={clickOn}
            aria-label={clickOn ? 'Desactivar metrónomo' : 'Activar metrónomo'}
            className={`flex flex-col items-center gap-1 rounded-2xl border px-2 py-3 text-xs font-semibold transition ${
              clickOn
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                : 'border-slate-700 bg-slate-950/80 text-slate-300'
            }`}
          >
            <Icon icon={Timer} size={15} />
            <span className="uppercase tracking-[0.24em]">Click</span>
            <span
              className={`h-2.5 w-2.5 rounded-full ${ledOn ? 'bg-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.5)]' : 'bg-slate-600'}`}
              aria-hidden="true"
            />
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-3xl border border-slate-800/80 bg-slate-950/90 p-4 shadow-panel">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-950/80 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Pitch</p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => applyPitchDelta(-1)}
              disabled={pitchOffset <= MIN_PITCH_SEMITONES}
              aria-label="Bajar un semitono"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-200 transition hover:border-slate-500 disabled:opacity-40"
            >
              <Icon icon={Minus} size={16} />
            </button>
            <div className="text-center" aria-live="polite" aria-atomic="true">
              <p className="text-xl font-semibold text-white">{pitchOffset}</p>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">semitonos</p>
            </div>
            <button
              type="button"
              onClick={() => applyPitchDelta(1)}
              disabled={pitchOffset >= MAX_PITCH_SEMITONES}
              aria-label="Subir un semitono"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-200 transition hover:border-slate-500 disabled:opacity-40"
            >
              <Icon icon={Plus} size={16} />
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-950/80 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Metrónomo</p>
            <span
              className={`h-2.5 w-2.5 rounded-full ${ledOn ? 'bg-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.5)]' : 'bg-slate-600'}`}
              aria-hidden="true"
            />
          </div>
          <button
            type="button"
            onClick={() => setClickOn(!clickOn)}
            aria-pressed={clickOn}
            aria-label={clickOn ? 'Desactivar metrónomo' : 'Activar metrónomo'}
            className={`mt-3 inline-flex h-10 w-full items-center justify-between rounded-xl border px-3 text-sm font-semibold transition ${
              clickOn
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600'
            }`}
          >
            <span className="flex items-center gap-2">
              <Icon icon={Timer} size={16} />
              {clickOn ? 'Encendido' : 'Apagado'}
            </span>
            <span className="text-xs uppercase tracking-[0.24em]">{clickOn ? 'On' : 'Off'}</span>
          </button>
        </div>
      </div>
    </section>
  )
}

export default memo(RehearsalMonitor)
