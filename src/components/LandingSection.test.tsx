import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { LandingSection } from './LandingSection'

describe('LandingSection', () => {
  it('renders a clear product message and a primary CTA', () => {
    const html = renderToStaticMarkup(<LandingSection />)

    expect(html).toContain('Ensayos musicales más claros')
    expect(html).toContain('stems')
    expect(html).toContain('Explorar la app')
  })
})
