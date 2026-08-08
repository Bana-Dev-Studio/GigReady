export type PersistedSession<T = unknown> = T & {
  id?: string
  title?: string
  updatedAt?: string
}

export class SessionRecoveryService<T = unknown> {
  private readonly storageKey: string

  constructor(storageKey = 'gigready:session') {
    this.storageKey = storageKey
  }

  public save(snapshot: PersistedSession<T>): void {
    try {
      const value = JSON.stringify(snapshot)
      localStorage.setItem(this.storageKey, value)
    } catch (error) {
      console.warn('[SessionRecoveryService] Unable to persist session snapshot', error)
    }
  }

  public load(fallback?: PersistedSession<T>): PersistedSession<T> | null {
    try {
      const raw = localStorage.getItem(this.storageKey)
      if (!raw) {
        return fallback ?? null
      }

      return JSON.parse(raw) as PersistedSession<T>
    } catch (error) {
      console.warn('[SessionRecoveryService] Unable to restore session snapshot', error)
      return fallback ?? null
    }
  }

  public clear(): void {
    try {
      localStorage.removeItem(this.storageKey)
    } catch (error) {
      console.warn('[SessionRecoveryService] Unable to clear session snapshot', error)
    }
  }
}

export const sessionRecoveryService = new SessionRecoveryService()
