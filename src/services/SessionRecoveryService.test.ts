import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SessionRecoveryService } from './SessionRecoveryService'

const storage = new Map<string, string>()

beforeEach(() => {
  vi.restoreAllMocks()
  storage.clear()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value)
    },
    removeItem: (key: string) => {
      storage.delete(key)
    },
    clear: () => {
      storage.clear()
    },
  })
})

describe('SessionRecoveryService', () => {

  it('persists the latest project snapshot and restores it', () => {
    const service = new SessionRecoveryService()
    const snapshot = { id: 'demo', title: 'Demo', isDirty: true } as any

    service.save(snapshot)
    const restored = service.load()

    expect(restored).toMatchObject({ id: 'demo', title: 'Demo', isDirty: true })
  })

  it('returns a fallback snapshot when storage is unavailable', () => {
    const service = new SessionRecoveryService()
    const storageMock = vi.mocked(localStorage)
    const getItemSpy = vi.spyOn(storageMock, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })

    const restored = service.load({ id: 'fallback', title: 'Fallback' } as any)

    expect(getItemSpy).toHaveBeenCalled()
    expect(restored).toMatchObject({ id: 'fallback', title: 'Fallback' })
  })
})
