import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { ContentSection } from './ContentSection'

describe('ContentSection', () => {
  it('renders a persuasive visual-content placeholder and an actionable TODO', () => {
    const html = renderToStaticMarkup(<ContentSection />)

    expect(html).toContain('Ver cómo funciona en 60 segundos')
    expect(html).toContain('// TODO: reemplazar este placeholder por contenido real, imagen, video o carousel')
  })
})
