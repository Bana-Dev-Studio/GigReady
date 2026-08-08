export type AppRoute = 'landing' | 'app'

function normalizePath(path: string): string {
  return path.replace(/\/+$/, '') || '/'
}

export function getAppRoute(pathname: string, basePath = '/'): AppRoute {
  const normalizedPath = normalizePath(pathname)
  const normalizedBase = normalizePath(basePath)

  const pathWithoutBase =
    normalizedBase !== '/' && normalizedPath.startsWith(`${normalizedBase}/`)
      ? normalizedPath.slice(normalizedBase.length)
      : normalizedPath === normalizedBase
        ? '/'
        : normalizedPath

  if (pathWithoutBase === '/app') {
    return 'app'
  }

  return 'landing'
}
