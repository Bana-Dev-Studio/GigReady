export function ConversionSection() {
  return (
    <section className="rounded-3xl border border-slate-800/80 bg-slate-900/70 p-8 shadow-panel">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">Conversión</p>
        <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
          Que cada visita se convierta en una siguiente acción clara
        </h2>
        <p className="mt-4 text-base leading-7 text-slate-300">
          La landing no solo debe explicar el producto, sino también guiar al visitante a probarlo, contactar o conocer más.
        </p>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-6">
          <h3 className="text-lg font-semibold text-white">Prueba la app</h3>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            El CTA principal debe llevar directo a la experiencia real del producto.
          </p>
          <a
            href="/app"
            className="mt-5 inline-flex items-center justify-center rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
          >
            Ir a la app
          </a>
        </div>

        <div className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-6">
          <h3 className="text-lg font-semibold text-white">Contactar o pedir más info</h3>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Acá podrías incluir un mail, formulario, WhatsApp o un enlace a una página de contacto.
          </p>
          <div className="mt-5 inline-flex items-center rounded-2xl border border-slate-700 px-4 py-3 text-sm text-slate-300">
            // TODO: agregar contacto real (mail, formulario, WhatsApp, etc.)
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-dashed border-slate-700 bg-slate-950/70 p-6">
        <h3 className="text-lg font-semibold text-white">Seguimiento y medición</h3>
        <p className="mt-3 text-sm leading-7 text-slate-400">
          Para medir el impacto, conviene conectar analytics y registrar qué CTA genera más interés.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <div className="inline-flex items-center rounded-2xl border border-slate-700 px-4 py-3 text-sm text-slate-300">
            // TODO: conectar analytics y eventos de CTA
          </div>
          <div className="inline-flex items-center rounded-2xl border border-slate-700 px-4 py-3 text-sm text-slate-300">
            // TODO: agregar redes sociales o canal de seguimiento
          </div>
        </div>
      </div>
    </section>
  )
}
