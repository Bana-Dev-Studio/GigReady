import { ClipService, type ClipDraft } from './ClipService'
import type { ProjectClip } from '../types/project'

export class ProjectClipRegistry {
  private static instance: ProjectClipRegistry | null = null
  private readonly clips = new Map<string, ProjectClip>()

  private constructor() {}

  public static getInstance(): ProjectClipRegistry {
    if (!ProjectClipRegistry.instance) {
      ProjectClipRegistry.instance = new ProjectClipRegistry()
    }
    return ProjectClipRegistry.instance
  }

  public addClip(draft: ClipDraft): ProjectClip {
    const clip = ClipService.createClip(draft)
    this.clips.set(clip.id, clip)
    return clip
  }

  public updateClip(id: string, updater: (clip: ProjectClip) => ProjectClip): ProjectClip | null {
    const current = this.clips.get(id)
    if (!current) return null

    const next = updater(current)
    this.clips.set(id, next)
    return next
  }

  public getClips(): ProjectClip[] {
    return Array.from(this.clips.values())
  }

  public clear(): void {
    this.clips.clear()
  }
}

export const projectClipRegistry = ProjectClipRegistry.getInstance()
