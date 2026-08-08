import { type ReactNode } from 'react'
import type { Song } from '../types'
import { ChevronLeft, Plus } from 'lucide-react'
import { Icon } from '../utils/Icon'

type SidebarProps = {
  songs: Song[]
  selectedId: string | null
  onSelect: (id: string) => void
  onUploadClick: () => void
  onToggleCollapse?: () => void
  children?: ReactNode
}

export default function Sidebar({ songs, selectedId, onSelect, onUploadClick, onToggleCollapse }: SidebarProps) {
  return (
    <aside className="flex h-full flex-col gap-6 rounded-3xl border border-slate-800/80 bg-slate-950/90 p-6 text-slate-100 shadow-panel">
      <div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">GigReady</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">GigReady</h1>
          </div>
          {onToggleCollapse ? (
            <button
  type="button"
  onClick={onToggleCollapse}
  aria-label="Minimizar menú de canciones"
  className="ml-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/50 text-slate-200 hover:bg-slate-900"
>
  <Icon icon={ChevronLeft} size={20} className="text-current" />
</button>
          ) : null}
        </div>
        <p className="mt-4 text-sm text-slate-400">Organiza tus ensayos, visualiza canciones y sincroniza BPM.</p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-100">Mis Canciones</span>
          <button
  type="button"
  onClick={onUploadClick}
  aria-label="Cargar nueva canción desde archivo"
  className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
>
  <Icon icon={Plus} size={18} strokeWidth={3} />
  <span>Nueva Canción</span>
</button>
        </div>

        <div className="space-y-3">
          {songs.map((song) => {
            const isSelected = song.id === selectedId
            return (
              <button
                key={song.id}
                type="button"
                onClick={() => onSelect(song.id)}
                aria-pressed={isSelected}
                aria-label={`Seleccionar canción: ${song.title}${isSelected ? ', seleccionada actualmente' : ''}`}
                className={`w-full rounded-3xl border px-4 py-4 text-left transition ${
                  isSelected
                    ? 'border-indigo-500/40 bg-slate-800/90 shadow-[0_0_0_1px_rgba(59,130,246,0.35)]'
                    : 'border-slate-800/60 bg-slate-950/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{song.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{song.subtitle}</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                      song.status === 'HQ'
                        ? 'bg-emerald-500/15 text-emerald-200'
                        : 'bg-amber-500/15 text-amber-200'
                    }`}
                  >
                    <span aria-hidden="true">{song.status === 'HQ' ? '☁️' : '⏳'}</span>
                    {song.status === 'HQ' ? 'HQ Procesado' : 'En espera'}
                  </span>
                </div>
              </button>
            )
          })}
          {songs.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/70 px-4 py-5 text-sm text-slate-400">
              <p className="font-semibold text-slate-200">No hay canciones cargadas</p>
              <p className="mt-1">Cargá un archivo para empezar a trabajar con una pista.</p>
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  )
}
