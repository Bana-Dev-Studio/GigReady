import { describe, expect, it } from 'vitest'
import { getAppRoute } from './router'

describe('router', () => {
  it('treats the home path as the public landing and /app as the private app route', () => {
    expect(getAppRoute('/')).toBe('landing')
    expect(getAppRoute('/app')).toBe('app')
    expect(getAppRoute('/app/')).toBe('app')
  })

  it('supports GitHub Pages subpaths through a configurable base path', () => {
    expect(getAppRoute('/TrackRehersal/', '/TrackRehersal/')).toBe('landing')
    expect(getAppRoute('/TrackRehersal/app', '/TrackRehersal/')).toBe('app')
    expect(getAppRoute('/TrackRehersal/app/', '/TrackRehersal/')).toBe('app')
  })
})
