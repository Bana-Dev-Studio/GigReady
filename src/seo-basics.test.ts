import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

describe('SEO basics', () => {
  it('includes primary metadata and sitemap/robots entry points', () => {
    const indexHtml = readFileSync(path.resolve(__dirname, '../index.html'), 'utf8')
    const robotsTxt = readFileSync(path.resolve(__dirname, '../public/robots.txt'), 'utf8')
    const sitemapXml = readFileSync(path.resolve(__dirname, '../public/sitemap.xml'), 'utf8')

    expect(indexHtml).toContain('<title>GigReady</title>')
    expect(indexHtml).toContain('<meta name="description"')
    expect(indexHtml).toContain('<link rel="canonical"')
    expect(indexHtml).toContain('<meta property="og:title"')
    expect(indexHtml).toContain('<meta property="og:description"')
    expect(robotsTxt).toContain('Sitemap:')
    expect(sitemapXml).toContain('<urlset')
  })
})
