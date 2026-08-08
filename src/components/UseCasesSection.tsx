export function UseCasesSection() {
  const useCases = [
    {
      title: 'Para bandas',
      description: 'Organizá ensayos con click track, tempo y stems para que cada músico llegue preparado y alineado.',
    },
    {
      title: 'Para equipos de worship',
      description: 'Mantené el pulso claro y simplificá la preparación de canciones con una experiencia de ensayo más ordenada.',
    },
    {
      title: 'Para ensayos con stems',
      description: 'Separá pistas, controlá el volumen y reducí la fricción cuando necesitás trabajar por capas.',
    },
  ]

  return (
    <section id="casos-de-uso" className="rounded-3xl border border-slate-800/80 bg-slate-900/70 p-8 shadow-panel">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">Casos de uso</p>
        <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
          Pensado para ensayos más claros y menos improvisaciones innecesarias
        </h2>
        <p className="mt-4 text-base leading-7 text-slate-300">
          Ya sea que trabajes con una banda, un equipo de worship o con stems para preparar canciones, GigReady ayuda a poner orden al ensayo.
        </p>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {useCases.map((useCase) => (
          <article key={useCase.title} className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-5">
            <h3 className="text-lg font-semibold text-white">{useCase.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-400">{useCase.description}</p>
          </article>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href="/app"
          className="inline-flex items-center justify-center rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
        >
          Probar la app
        </a>
        <a
          href="#funciones"
          className="inline-flex items-center justify-center rounded-2xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
        >
          Volver a funciones
        </a>
      </div>
    </section>
  )
}
