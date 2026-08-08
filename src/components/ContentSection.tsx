export function ContentSection() {
  return (
    <section className="rounded-3xl border border-slate-800/80 bg-slate-900/70 p-8 shadow-panel">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">Flujo de trabajo</p>
        <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
          Diseñado por músicos, para simplificar el ensayo
        </h2>
        <p className="mt-4 text-base leading-7 text-slate-300">
          La interfaz prioriza lo importante: velocidad de carga, controles táctiles intuitivos y una visualización clara para que no pierdas tiempo configurando software pesado en medio de la sala.
        </p>
      </div>

      <div className="mt-8 rounded-3xl border border-slate-800/70 bg-slate-950/70 p-8 text-center">
        <h3 className="text-lg font-semibold text-white">Todo listo para tocar</h3>
        <p className="mt-3 text-sm leading-7 text-slate-400 max-w-xl mx-auto">
          Cargá tus pistas, ajustá el metrónomo y sincroniza a toda la banda sin vueltas.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a
            href="/app"
            className="inline-flex items-center justify-center rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
          >
            Probar GigReady ahora
          </a>
        </div>
      </div>
    </section>
  )
}