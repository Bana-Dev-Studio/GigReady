import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { usePlayerStore } from '../store/usePlayerStore'
import type { PlayerState } from '../types'
import { Clock, MapPin, X } from 'lucide-react'
import { Icon } from '../utils/Icon'
import { getActiveMarker, getSectionForTime } from '../services/TimelineService'
import type { TimelineJumpRoute, TimelineMarker, TimelineSection } from '../services/TimelineService'
import { timelineSyncService } from '../services/TimelineSyncService'
import { errorReporter } from '../services/ErrorReporter'

type ClickTrackTimelineProps = {
  markers: TimelineMarker[]
  sections?: TimelineSection[]
  jumpRoutes?: TimelineJumpRoute[]
  bpm: number
  timeSignature: [number, number]
  displayOffsetSeconds?: number
  initialCountBeats?: number
  onMarkerClick: (time: number) => void
  onSectionClick?: (time: number) => void
  onAddJumpRoute?: (fromMeasure: number, toMeasure: number, maxJumps: number) => void
  onRemoveJumpRoute?: (jumpRouteId: string) => void
  onApplyInitialCount?: (beats: number, bpm: number) => void
  onClearInitialCount?: () => void
}

function ClickTrackTimeline({
  markers,
  sections = [],
  jumpRoutes = [],
  bpm,
  timeSignature,
  displayOffsetSeconds = 0,
  initialCountBeats = 0,
  onMarkerClick,
  onSectionClick,
  onAddJumpRoute,
  onRemoveJumpRoute,
  onApplyInitialCount,
  onClearInitialCount,
}: ClickTrackTimelineProps) {
  const renderCount = useRef(0)
  const currentPlaybackTime = usePlayerStore((state: PlayerState) => state.currentTime)
  const [initialCountBeatsDraft, setInitialCountBeatsDraft] = useState(initialCountBeats)
  const [initialCountBpmDraft, setInitialCountBpmDraft] = useState(bpm)
  const [jumpFromMeasureDraft, setJumpFromMeasureDraft] = useState<number | null>(null)
  const [jumpToMeasureDraft, setJumpToMeasureDraft] = useState<number | null>(null)
  const [jumpCountDraft, setJumpCountDraft] = useState(1)
  const beatMarkers = useMemo(() => markers.filter((marker) => marker.type === 'beat'), [markers])
  const currentPosition = useMemo(() => timelineSyncService.getClockSnapshot({
    playbackTimeSeconds: currentPlaybackTime,
    bpm,
    timeSignature,
  }), [bpm, currentPlaybackTime, timeSignature])
  const measures = markers.reduce<Record<number, TimelineMarker[]>>((acc, marker) => {
    if (marker.type !== 'beat' || marker.measure == null) return acc
    if (!acc[marker.measure]) acc[marker.measure] = []
    acc[marker.measure].push(marker)
    return acc
  }, {})
  const measureNumbers = Object.keys(measures).map(Number).sort((a, b) => a - b)
  useEffect(() => {
    if (measureNumbers.length === 0) return

    setJumpFromMeasureDraft((prev) => {
      if (prev != null && measureNumbers.includes(prev)) return prev
      return measureNumbers[0]
    })

    setJumpToMeasureDraft((prev) => {
      if (prev != null && measureNumbers.includes(prev)) return prev
      return measureNumbers[Math.min(1, measureNumbers.length - 1)]
    })

    setJumpCountDraft((prev) => (prev > 0 ? prev : 1))
  }, [measureNumbers])

  useEffect(() => {
    setInitialCountBeatsDraft(initialCountBeats)
  }, [initialCountBeats])

  useEffect(() => {
    setInitialCountBpmDraft(bpm)
  }, [bpm])

  const isForwardJumpDraft = jumpFromMeasureDraft != null
    && jumpToMeasureDraft != null
    && jumpFromMeasureDraft < jumpToMeasureDraft

  const canAddJumpRoute = jumpFromMeasureDraft != null
    && jumpToMeasureDraft != null
    && jumpFromMeasureDraft !== jumpToMeasureDraft
    && (isForwardJumpDraft ? 1 : jumpCountDraft) > 0

  useEffect(() => {
    renderCount.current += 1
    errorReporter.recordMetric('ui-render', 'timeline-render', renderCount.current, {
      markers: markers.length,
      sections: sections.length,
      jumpRoutes: jumpRoutes.length,
      bpm,
    })
  })
  if (markers.length === 0) {
    return (
      <section className="rounded-3xl border border-slate-800/80 bg-slate-950/90 p-6 shadow-panel">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Click Track Timeline</p>
        <div className="mt-4 rounded-3xl border border-dashed border-slate-700 bg-slate-950/80 p-8 text-center text-sm text-slate-500">
          No hay marcas de click disponibles.
        </div>
      </section>
    )
  }

  
  const activeBeatMarker = getActiveMarker(beatMarkers, currentPlaybackTime)
  const activeSection = getSectionForTime({ sections }, currentPlaybackTime)
  

  

  

  return (
    <section className="rounded-3xl border border-slate-800/80 bg-slate-950/90 p-6 shadow-panel">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Click Track Timeline</p>
          <p className="mt-2 text-sm text-slate-400">Haz clic en un golpe para saltar a ese punto del tema.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-300">
            {markers.length} marcas
          </span>
          <span className="inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-cyan-200">
            Beat {currentPosition.beat} · Compás {currentPosition.measure}
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {activeSection ? (
          <button
            type="button"
            onClick={() => (onSectionClick ?? onMarkerClick)(activeSection.startTimeSeconds)}
            className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-sm text-sky-200"
          >
            <Icon icon={MapPin} size={14} />
            Sección: {activeSection.label}
          </button>
        ) : null}
      </div>

      <div className="mt-4 rounded-2xl border border-emerald-800/50 bg-emerald-950/20 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-xs uppercase tracking-[0.22em] text-emerald-200">
              Conteo inicial
              <input
                type="number"
                min={0}
                max={64}
                value={initialCountBeatsDraft}
                onChange={(event) => setInitialCountBeatsDraft(Math.max(0, Number(event.target.value) || 0))}
                className="mt-2 w-full rounded-xl border border-emerald-700/60 bg-slate-950 px-3 py-2 text-sm text-emerald-100"
              />
            </label>
            <label className="text-xs uppercase tracking-[0.22em] text-emerald-200">
              BPM conteo
              <input
                type="number"
                min={1}
                max={400}
                value={initialCountBpmDraft}
                onChange={(event) => setInitialCountBpmDraft(Math.max(1, Number(event.target.value) || 1))}
                className="mt-2 w-full rounded-xl border border-emerald-700/60 bg-slate-950 px-3 py-2 text-sm text-emerald-100"
              />
            </label>
            <div className="text-xs uppercase tracking-[0.22em] text-emerald-200">
              Offset actual
              <div className="mt-2 rounded-xl border border-emerald-700/60 bg-slate-950 px-3 py-2 text-sm text-emerald-100">
                {displayOffsetSeconds.toFixed(2)}s
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!onApplyInitialCount}
              onClick={() => onApplyInitialCount?.(initialCountBeatsDraft, initialCountBpmDraft)}
              className="rounded-xl border border-emerald-500/60 bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Aplicar offset inicial
            </button>
            <button
              type="button"
              disabled={!onClearInitialCount}
              onClick={() => onClearInitialCount?.()}
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Quitar offset
            </button>
            <button
              type="button"
              disabled
              className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-100 opacity-70"
            >
              Conteo inicial automatico · Premium
            </button>
          </div>
        </div>
      </div>

      {measureNumbers.length > 1 ? (
        <div className="mt-4 rounded-2xl border border-amber-800/50 bg-amber-950/20 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="text-xs uppercase tracking-[0.22em] text-amber-200">
                Desde compás
                <select
                  className="mt-2 w-full rounded-xl border border-amber-700/60 bg-slate-950 px-3 py-2 text-sm text-amber-100"
                  value={jumpFromMeasureDraft ?? ''}
                  onChange={(event) => setJumpFromMeasureDraft(Number(event.target.value))}
                >
                  {measureNumbers.map((measureNumber) => (
                    <option key={`jump-from-${measureNumber}`} value={measureNumber}>
                      {measureNumber}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs uppercase tracking-[0.22em] text-amber-200">
                Hacia compás
                <select
                  className="mt-2 w-full rounded-xl border border-amber-700/60 bg-slate-950 px-3 py-2 text-sm text-amber-100"
                  value={jumpToMeasureDraft ?? ''}
                  onChange={(event) => setJumpToMeasureDraft(Number(event.target.value))}
                >
                  {measureNumbers.map((measureNumber) => (
                    <option key={`jump-to-${measureNumber}`} value={measureNumber}>
                      {measureNumber}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs uppercase tracking-[0.22em] text-amber-200">
                Veces
                <input
                  type="number"
                  min={1}
                  max={64}
                  value={isForwardJumpDraft ? 1 : jumpCountDraft}
                  disabled={isForwardJumpDraft}
                  onChange={(event) => setJumpCountDraft(Math.max(1, Number(event.target.value) || 1))}
                  className="mt-2 w-full rounded-xl border border-amber-700/60 bg-slate-950 px-3 py-2 text-sm text-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </label>
            </div>

            <button
              type="button"
              disabled={!canAddJumpRoute || !onAddJumpRoute}
              onClick={() => {
                if (!canAddJumpRoute || !onAddJumpRoute) return
                onAddJumpRoute(jumpFromMeasureDraft, jumpToMeasureDraft, isForwardJumpDraft ? 1 : jumpCountDraft)
              }}
              className="rounded-xl border border-amber-500/60 bg-amber-500/20 px-4 py-2 text-sm font-semibold text-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              + Agregar salto
            </button>
          </div>
          {isForwardJumpDraft ? (
            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-amber-300">
              Los saltos hacia adelante se ejecutan una sola vez.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 grid gap-4">
        {sections.length > 0 ? (
          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/80 p-3">
            <div className="mb-3 flex items-center justify-between gap-4">
              <span className="text-xs uppercase tracking-[0.24em] text-slate-500">Secciones</span>
              <span className="rounded-full bg-slate-900 px-2 py-1 text-[11px] uppercase tracking-[0.24em] text-slate-300">
                {sections.length} secciones
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => (onSectionClick ?? onMarkerClick)(section.startTimeSeconds)}
                  className="rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-left text-sm text-slate-300 transition hover:border-slate-500"
                >
                  <span className="block font-semibold">{section.label}</span>
                  <span className="mt-1 block text-[10px] uppercase tracking-[0.24em] text-slate-500">
                    {section.startTimeSeconds.toFixed(2)}s · {section.endTimeSeconds.toFixed(2)}s
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {jumpRoutes.length > 0 ? (
          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/80 p-3">
            <div className="mb-3 flex items-center justify-between gap-4">
              <span className="text-xs uppercase tracking-[0.24em] text-slate-500">Jump routes</span>
              <span className="rounded-full bg-slate-900 px-2 py-1 text-[11px] uppercase tracking-[0.24em] text-slate-300">
                {jumpRoutes.length} saltos
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {jumpRoutes.map((jumpRoute) => (
                <div key={jumpRoute.id} className="flex items-start gap-2 rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-left text-sm text-slate-300 transition hover:border-slate-500">
                  <button
                    type="button"
                    onClick={() => onMarkerClick(jumpRoute.targetTimeSeconds)}
                    className="min-w-0 text-left"
                  >
                    <span className="block font-semibold">{jumpRoute.label}</span>
                    <span className="mt-1 block text-[10px] uppercase tracking-[0.24em] text-slate-500">
                      C{jumpRoute.fromMeasure} {'->'} C{jumpRoute.toMeasure} · {jumpRoute.maxJumps} veces
                    </span>
                  </button>
                  {onRemoveJumpRoute ? (
                    <button
                      type="button"
                      aria-label={`Eliminar ${jumpRoute.label}`}
                      onClick={(event) => {
                        event.stopPropagation()
                        onRemoveJumpRoute(jumpRoute.id)
                      }}
                      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-rose-500/50 text-rose-300 transition hover:bg-rose-500/20"
                    >
                      <Icon icon={X} size={12} />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {measureNumbers
          .map((measureNumber) => (
            <div key={measureNumber} className="rounded-2xl border border-slate-800/80 bg-slate-950/80 p-3">
              <div className="mb-3 flex items-center justify-between gap-4">
                <span className="text-xs uppercase tracking-[0.24em] text-slate-500">Compás {measureNumber}</span>
                <span className="rounded-full bg-slate-900 px-2 py-1 text-[11px] uppercase tracking-[0.24em] text-slate-300">
                  {measures[measureNumber].length} negras
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {measures[measureNumber].map((marker) => {
                  const isActive = activeBeatMarker?.id === marker.id
                  return (
                    <button
  key={`${marker.id}`}
  type="button"
  onClick={() => onMarkerClick(marker.timeSeconds)}
  className={`min-w-[56px] rounded-2xl border px-3 py-2 text-left transition ${
    isActive
      ? 'border-cyan-400 bg-cyan-500/10 text-white'
      : 'border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500'
  }`}
>
  <span className="block font-semibold">{marker.label}</span>
  <span className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">
    <Icon icon={Clock} size={10} className="text-slate-600" />
    {marker.timeSeconds.toFixed(2)}s
  </span>
</button>
                  )
                })}
              </div>
            </div>
          ))}
      </div>
    </section>
  )
}

export default memo(ClickTrackTimeline)
