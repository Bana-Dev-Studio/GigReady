import { ContentSection } from './components/ContentSection'
import { ConversionSection } from './components/ConversionSection'
import { UseCasesSection } from './components/UseCasesSection'

export function PublicLanding() {
  // Obtenemos el base path de forma segura
const basePath = import.meta.env.VITE_BASE_PATH || '/'
// Limpiamos la barra final si existe para evitar doble barra (ej: "/GigReady//app")
const cleanBase = basePath === '/' ? '' : basePath.replace(/\/$/, '')
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-20 lg:px-8">
        
        {/* HERO SECTION */}
        <div className="max-w-3xl rounded-3xl border border-slate-800/80 bg-slate-900/70 p-8 shadow-panel sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">GigReady</p>
          
          {/* ✅ CORREGIDO: Único H1 principal de la página con keywords clave */}
          <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl tracking-tight">
            GigReady — Ensayos Musicales con Stems y Click Track
          </h1>
          
          <p className="mt-5 text-lg leading-8 text-slate-300">
            Potenciá los ensayos de tu banda y optimiza tu flujo de trabajo. Sincroniza stems, controla el tempo y llega a tocar en vivo con precisión milimétrica y cero fricción.
          </p>
          
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={`${cleanBase}/app`}
              className="inline-flex items-center justify-center rounded-2xl bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
            >
              Comenzar a usar GigReady
            </a>
            <a
              href="#funciones"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
            >
              Ver funciones
            </a>
          </div>
        </div>

        {/* SECCIÓN DE FUNCIONES (H2 y H3 correctos) */}
        <div id="funciones" className="mt-12">
          <h2 className="text-2xl font-semibold text-white tracking-tight sm:text-3xl mb-6">
            Herramientas diseñadas para músicos exigentes
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-5">
              <h3 className="text-lg font-semibold text-white">Ensayá con tus stems</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Separá, organizá y escuchá pistas individuales de instrumentos o voces para pulir cada detalle del repertorio.
              </p>
            </article>

            <article className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-5">
              <h3 className="text-lg font-semibold text-white">Click track y control de tempo</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Mantené el pulso firme en cada canción y facilitá la sincronización exacta de toda la banda en directo.
              </p>
            </article>

            <article className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-5">
              <h3 className="text-lg font-semibold text-white">Sesiones más ordenadas</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Reducí el tiempo perdido entre tema y tema para enfocar toda la energía creativa directamente en la música.
              </p>
            </article>
          </div>
        </div>

        {/* RESTO DE SECCIONES */}
        <div className="mt-12">
          <UseCasesSection />
        </div>

        <div className="mt-12">
          <ContentSection />
        </div>

        <div className="mt-12">
          <ConversionSection />
        </div>
      </section>
    </main>
  )
}