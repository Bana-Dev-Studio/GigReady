import type { ClipEditState, ProjectClip } from '../types/project'

export type ClipDraft = {
  trackId: string
  title?: string
  startTimeSeconds: number
  endTimeSeconds: number
  offsetSeconds?: number
  sourceUrl?: string | null
  editState?: ClipEditState
  sourceStartSeconds?: number
  sourceEndSeconds?: number
  sourceDurationSeconds?: number
}

export class ClipService {
  public static createClip(draft: ClipDraft): ProjectClip {
    const durationSeconds = Math.max(0, draft.endTimeSeconds - draft.startTimeSeconds)

    return {
      id: `clip-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      trackId: draft.trackId,
      startTimeSeconds: draft.startTimeSeconds,
      endTimeSeconds: draft.endTimeSeconds,
      durationSeconds,
      offsetSeconds: draft.offsetSeconds ?? 0,
      status: 'ready',
      sourceUrl: draft.sourceUrl,
      title: draft.title,
      editState: draft.editState ?? 'idle',
      sourceStartSeconds: draft.sourceStartSeconds,
      sourceEndSeconds: draft.sourceEndSeconds,
      sourceDurationSeconds: draft.sourceDurationSeconds,
    }
  }

  public static updateClipStatus(clip: ProjectClip, status: ProjectClip['status']): ProjectClip {
    return {
      ...clip,
      status,
    }
  }

  public static selectClip(clip: ProjectClip, selected: boolean): ProjectClip {
    return {
      ...clip,
      editState: selected ? 'selected' : 'idle',
    }
  }

  public static hoverClip(clip: ProjectClip, hovered: boolean): ProjectClip {
    if (clip.editState === 'selected' && hovered) {
      return clip
    }

    return {
      ...clip,
      editState: hovered ? 'hovered' : 'idle',
    }
  }

  public static moveClip(clip: ProjectClip, deltaSeconds: number): ProjectClip {
    const nextStart = clip.startTimeSeconds + deltaSeconds
    const nextEnd = clip.endTimeSeconds + deltaSeconds

    return {
      ...clip,
      startTimeSeconds: nextStart,
      endTimeSeconds: nextEnd,
      offsetSeconds: clip.offsetSeconds + deltaSeconds,
      durationSeconds: Math.max(0, nextEnd - nextStart),
      editState: 'dragging',
    }
  }

  public static trimClip(clip: ProjectClip, startDeltaSeconds: number, endDeltaSeconds: number): ProjectClip {
    const nextStart = Math.max(0, clip.startTimeSeconds + startDeltaSeconds)
    const nextEnd = Math.max(nextStart + 0.001, clip.endTimeSeconds + endDeltaSeconds)

    return {
      ...clip,
      startTimeSeconds: nextStart,
      endTimeSeconds: nextEnd,
      durationSeconds: Math.max(0, nextEnd - nextStart),
      editState: 'trimming',
    }
  }

  public static toggleClipMute(clip: ProjectClip): ProjectClip {
    return {
      ...clip,
      status: clip.status === 'ready' ? 'error' : 'ready',
    }
  }
}
