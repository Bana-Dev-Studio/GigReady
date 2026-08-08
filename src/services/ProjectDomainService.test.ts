import { describe, expect, it } from 'vitest'
import { ProjectDomainService } from './ProjectDomainService'

describe('ProjectDomainService', () => {
  it('creates a project session with a default main track and editable metadata', () => {
    const session = ProjectDomainService.createSession({ title: 'Session A' })

    expect(session.title).toBe('Session A')
    expect(session.tracks.some((track) => track.type === 'main')).toBe(true)
    expect(session.selectedTrackIds).toEqual([])
    expect(session.isDirty).toBe(false)
  })

  it('adds a track and clamps clip edits to a non-negative duration', () => {
    const session = ProjectDomainService.createSession()
    const withTrack = ProjectDomainService.addTrack(session, {
      id: 'guide-1',
      type: 'recording',
      title: 'Guide',
      enabled: true,
      gain: 0.8,
      offsetSeconds: 0,
    })

    const withClip = ProjectDomainService.upsertClip(withTrack, {
      trackId: 'guide-1',
      startTimeSeconds: 4,
      endTimeSeconds: 2,
      title: 'Take 1',
      editState: 'selected',
    })

    expect(withClip.tracks).toHaveLength(3)
    expect(withClip.clips[0].durationSeconds).toBe(0)
    expect(withClip.clips[0].editState).toBe('selected')
    expect(withClip.isDirty).toBe(true)
  })

  it('applies a partial session update and marks the session dirty', () => {
    const session = ProjectDomainService.createSession({ title: 'Session A' })

    const updated = ProjectDomainService.updateSession(session, {
      title: 'Session B',
      transport: {
        ...session.transport,
        mode: 'playing',
        playheadSeconds: 12,
      },
    })

    expect(updated.title).toBe('Session B')
    expect(updated.transport.mode).toBe('playing')
    expect(updated.transport.playheadSeconds).toBe(12)
    expect(updated.isDirty).toBe(true)
    expect(updated.updatedAt).not.toBe(session.updatedAt)
  })

  it('preserves the selected song context in the snapshot', () => {
    const session = ProjectDomainService.createSession()

    const updated = ProjectDomainService.updateSession(session, {
      selectedSongId: 'song-1',
    })

    const snapshot = ProjectDomainService.toSnapshot(updated)

    expect(snapshot.selectedSongId).toBe('song-1')
  })

  it('selects a clip and clears the previous selection', () => {
    const session = ProjectDomainService.createSession()
    const withClipA = ProjectDomainService.upsertClip(session, {
      trackId: 'main',
      startTimeSeconds: 0,
      endTimeSeconds: 2,
      title: 'A',
      editState: 'selected',
    })
    const withClipB = ProjectDomainService.upsertClip(withClipA, {
      trackId: 'main',
      startTimeSeconds: 2,
      endTimeSeconds: 4,
      title: 'B',
    })

    const updated = ProjectDomainService.setClipSelection(withClipB, withClipB.clips[1].id, true)

    expect(updated.clips[0].editState).toBe('idle')
    expect(updated.clips[1].editState).toBe('selected')
  })

  it('marks a clip as hovered and clears hover on others', () => {
    const session = ProjectDomainService.createSession()
    const withClipA = ProjectDomainService.upsertClip(session, {
      trackId: 'track-a',
      startTimeSeconds: 0,
      endTimeSeconds: 2,
      editState: 'idle',
    })
    const withClipB = ProjectDomainService.upsertClip(withClipA, {
      trackId: 'track-b',
      startTimeSeconds: 3,
      endTimeSeconds: 5,
      editState: 'idle',
    })

    const updated = ProjectDomainService.setClipHover(withClipB, withClipB.clips[0].id, true)

    expect(updated.clips[0].editState).toBe('hovered')
    expect(updated.clips[1].editState).toBe('idle')
  })
})
