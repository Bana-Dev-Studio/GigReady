import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { ConversionSection } from './ConversionSection'

describe('ConversionSection', () => {
  it('renders conversion-oriented messaging and actionable TODO placeholders', () => {
    const html = renderToStaticMarkup(<ConversionSection />)

    expect(html).toContain('Prueba la app')
    expect(html).toContain('// TODO: agregar contacto real (mail, formulario, WhatsApp, etc.)')
    expect(html).toContain('// TODO: conectar analytics y eventos de CTA')
  })
})
