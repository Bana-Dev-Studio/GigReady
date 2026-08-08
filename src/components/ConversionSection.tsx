

export function ConversionSection() {
  return (
    <section className="rounded-3xl border border-slate-800/80 bg-slate-900/70 p-8 shadow-panel">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">Empezá ahora</p>
        <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
          Llevá tus ensayos al siguiente nivel de precisión
        </h2>
        <p className="mt-4 text-base leading-7 text-slate-300">
          Dejá atrás el caos de los audios sueltos y las pistas desorganizadas. Comenzá a usar GigReady en tu próximo ensayo.
        </p>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Prueba la app web</h3>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Accedé de forma directa a la herramienta y probá la sincronización de stems y control de tempo al instante.
            </p>
          </div>
          <a
            href="/app"
            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
          >
            Ir a la app
          </a>
        </div>

        <div className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">¿Tenés dudas o sugerencias?</h3>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              GigReady está en constante evolución. Si querés proponer una función o contactar al equipo de desarrollo, escribinos.
            </p>
          </div>
          <a
            href="mailto:contacto@gigready.com" 
            className="mt-6 inline-flex items-center justify-center rounded-2xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
          >
            Contactar por mail
          </a>
        </div>
      </div>
    </section>
  )
}


