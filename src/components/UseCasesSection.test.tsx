import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { UseCasesSection } from './UseCasesSection'

describe('UseCasesSection', () => {
  it('renders audience-specific use cases and a primary app CTA', () => {
    const html = renderToStaticMarkup(<UseCasesSection />)

    expect(html).toContain('Para bandas')
    expect(html).toContain('Para equipos de worship')
    expect(html).toContain('Para ensayos con stems')
    expect(html).toContain('/app')
  })
})
