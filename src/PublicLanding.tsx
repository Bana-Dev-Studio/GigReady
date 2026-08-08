import { ContentSection } from './components/ContentSection'
import { ConversionSection } from './components/ConversionSection'
import { UseCasesSection } from './components/UseCasesSection'

export function PublicLanding() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-20 lg:px-8">
        <div className="max-w-3xl rounded-3xl border border-slate-800/80 bg-slate-900/70 p-8 shadow-panel sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">GigReady</p>
          <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
            Ensayos musicales más claros para bandas y equipos
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            Prepará ensayos con stems, click tracks y tempo en una experiencia simple para mantener el pulso y el foco en la música.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="/app"
              className="inline-flex items-center justify-center rounded-2xl bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
            >
              Ir a la app
            </a>
            <a
              href="#funciones"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
            >
              Ver funciones
            </a>
          </div>
        </div>

        <div id="funciones" className="mt-10 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-5">
            <h2 className="text-lg font-semibold text-white">Trabajo con stems</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Organizá y escuchá pistas por separado para preparar ensayos con más control.
            </p>
          </article>
          <article className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-5">
            <h2 className="text-lg font-semibold text-white">Click track y tempo</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Mantené el pulso claro y facilitá la sincronización del grupo.
            </p>
          </article>
          <article className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-5">
            <h2 className="text-lg font-semibold text-white">Sesiones más ordenadas</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Reducí la fricción y dejá la energía en la música en lugar de la organización.
            </p>
          </article>
        </div>

        <div className="mt-10">
          <UseCasesSection />
        </div>

        <div className="mt-10">
          <ContentSection />
        </div>

        <div className="mt-10">
          <ConversionSection />
        </div>
      </section>
    </main>
  )
}
