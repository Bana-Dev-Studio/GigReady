import { createInitialProjectState, type ProjectClip, type ProjectState, type ProjectTrack, type ClipEditState } from '../types/project'
import { ClipService, type ClipDraft } from './ClipService'

export type ProjectSessionInput = {
  title?: string
  createdAt?: string
  updatedAt?: string
}

export type ProjectTrackDraft = Omit<ProjectTrack, 'id'> & {
  id?: string
}

export class ProjectDomainService {
  public static createSession(input: ProjectSessionInput = {}): ProjectState {
    const base = createInitialProjectState()

    return {
      ...base,
      title: input.title ?? base.title,
      createdAt: input.createdAt ?? base.createdAt,
      updatedAt: input.updatedAt ?? base.updatedAt,
      selectedTrackIds: [],
      selectedSongId: null,
      isDirty: false,
      tracks: base.tracks.map((track) => ({ ...track })),
      clips: [],
      annotations: [],
    }
  }

  public static addTrack(project: ProjectState, draft: ProjectTrackDraft): ProjectState {
    const track: ProjectTrack = {
      id: draft.id ?? `track-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type: draft.type ?? 'recording',
      title: draft.title ?? 'Nueva pista',
      sourceUrl: draft.sourceUrl ?? null,
      enabled: draft.enabled ?? true,
      gain: draft.gain ?? 1,
      offsetSeconds: draft.offsetSeconds ?? 0,
      durationSeconds: draft.durationSeconds,
    }

    return {
      ...project,
      tracks: [...project.tracks, track],
      isDirty: true,
      updatedAt: new Date().toISOString(),
    }
  }

  public static upsertClip(project: ProjectState, draft: ClipDraft & { editState?: ClipEditState }): ProjectState {
    const clip = ClipService.createClip(draft)

    return {
      ...project,
      clips: [...project.clips, clip],
      isDirty: true,
      updatedAt: new Date().toISOString(),
    }
  }

  public static updateClip(project: ProjectState, clipId: string, updater: (clip: ProjectClip) => ProjectClip): ProjectState {
    const nextClips = project.clips.map((clip) => (clip.id === clipId ? updater(clip) : clip))

    return {
      ...project,
      clips: nextClips,
      isDirty: true,
      updatedAt: new Date().toISOString(),
    }
  }

  public static setClipSelection(project: ProjectState, clipId: string, selected: boolean): ProjectState {
    const nextClips = project.clips.map((clip) => {
      if (clip.id === clipId) {
        return ClipService.selectClip(clip, selected)
      }

      if (selected && clip.editState === 'selected') {
        return ClipService.selectClip(clip, false)
      }

      return clip
    })

    return {
      ...project,
      clips: nextClips,
      isDirty: true,
      updatedAt: new Date().toISOString(),
    }
  }

  public static setClipHover(project: ProjectState, clipId: string, hovered: boolean): ProjectState {
    const nextClips = project.clips.map((clip) => {
      if (clip.id === clipId) {
        return ClipService.hoverClip(clip, hovered)
      }

      if (!hovered && clip.editState === 'hovered') {
        return ClipService.hoverClip(clip, false)
      }

      return clip
    })

    return {
      ...project,
      clips: nextClips,
      isDirty: true,
      updatedAt: new Date().toISOString(),
    }
  }

  public static updateSession(project: ProjectState, partial: Partial<ProjectState>): ProjectState {
    const nextUpdatedAt = (() => {
      const base = Date.now()
      const previous = Date.parse(project.updatedAt)
      return new Date(previous >= base ? base + 1 : base).toISOString()
    })()

    return {
      ...project,
      ...partial,
      transport: {
        ...project.transport,
        ...(partial.transport ?? {}),
      },
      timeline: {
        ...project.timeline,
        ...(partial.timeline ?? {}),
      },
      tracks: partial.tracks ?? project.tracks,
      clips: partial.clips ?? project.clips,
      annotations: partial.annotations ?? project.annotations,
      isDirty: true,
      updatedAt: nextUpdatedAt,
    }
  }

  public static toSnapshot(project: ProjectState): ProjectState {
    return {
      ...project,
      tracks: project.tracks.map((track) => ({ ...track })),
      clips: project.clips.map((clip) => ({ ...clip })),
      annotations: project.annotations.map((annotation) => ({ ...annotation })),
      timeline: {
        ...project.timeline,
        markers: project.timeline.markers.map((marker) => ({ ...marker })),
        sections: project.timeline.sections.map((section) => ({ ...section })),
        jumpRoutes: project.timeline.jumpRoutes.map((jumpRoute) => ({ ...jumpRoute })),
      },
    }
  }
}
