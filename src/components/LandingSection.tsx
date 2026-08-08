export function LandingSection() {
  return (
    <section className="rounded-3xl border border-slate-800/80 bg-slate-950/90 p-6 shadow-panel sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">GigReady</p>
          <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
            Ensayos musicales más claros para bandas y equipos
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-300">
            Trabajá con stems, click tracks y tempo en una sola experiencia para preparar ensayos con más enfoque y menos caos.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href="#app"
            className="inline-flex items-center justify-center rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
          >
            Explorar la app
          </a>
          <a
            href="#funciones"
            className="inline-flex items-center justify-center rounded-2xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
          >
            Ver funciones
          </a>
        </div>
      </div>

      <div id="funciones" className="mt-8 grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-800/70 bg-slate-900/70 p-4">
          <h2 className="text-lg font-semibold text-white">Trabajo con stems</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Organizá y mezclá pistas de forma simple para preparar ensayos con más control.
          </p>
        </article>
        <article className="rounded-2xl border border-slate-800/70 bg-slate-900/70 p-4">
          <h2 className="text-lg font-semibold text-white">Click track y tempo</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Mantené el pulso claro con una experiencia visual para seguir el compás.
          </p>
        </article>
        <article className="rounded-2xl border border-slate-800/70 bg-slate-900/70 p-4">
          <h2 className="text-lg font-semibold text-white">Sesiones más ordenadas</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Reducí la fricción en cada ensayo y dejá la atención en la música.
          </p>
        </article>
      </div>
    </section>
  )
}
