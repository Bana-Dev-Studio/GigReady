export function ContentSection() {
  return (
    <section className="rounded-3xl border border-slate-800/80 bg-slate-900/70 p-8 shadow-panel">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">Contenido útil</p>
        <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
          Mostrar cómo funciona en un ensayo, no solo decirlo
        </h2>
        <p className="mt-4 text-base leading-7 text-slate-300">
          Este bloque puede ayudar a convertir a quien todavía duda: una demo visual, un ejemplo de flujo o un recurso breve que muestre el valor real del producto.
        </p>
      </div>

      <div className="mt-8 rounded-3xl border border-dashed border-slate-700 bg-slate-950/70 p-8 text-center">
        <p className="text-lg font-semibold text-white">Ver cómo funciona en 60 segundos</p>
        <p className="mt-3 text-sm leading-7 text-slate-400">
          Acá podrías mostrar una imagen, un video corto, un carousel o una captura del flujo de la app para que la propuesta sea más concreta y fácil de entender.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a
            href="/app"
            className="inline-flex items-center justify-center rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
          >
            Ver la app
          </a>
          <div className="inline-flex items-center rounded-2xl border border-slate-700 px-4 py-3 text-sm text-slate-300">
            // TODO: reemplazar este placeholder por contenido real, imagen, video o carousel
          </div>
        </div>
      </div>
    </section>
  )
}
