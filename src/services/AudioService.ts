import { SoundTouchNode } from '@soundtouchjs/audio-worklet'
import type { SoundTouchNode as SoundTouchNodeType } from '../types'
import { errorReporter } from './ErrorReporter'

type PlaybackTrack = {
  buffer: AudioBuffer
  offset: number
  enabled: boolean
  gain?: number
  applyPitch?: boolean
}

type PlaybackRequest = {
  mainBuffer: AudioBuffer | null
  clickBuffer: AudioBuffer | null
  isClickEnabled: boolean
  primaryTrackOffset?: number
  recordedTracks?: PlaybackTrack[]
  clipTracks?: PlaybackTrack[]
  stemTracks?: PlaybackTrack[]
}

export class AudioService {
  private static instance: AudioService | null = null

  private ctx: AudioContext | null = null
  private outputGain: GainNode | null = null
  private clickGain: GainNode | null = null
  private stNode: SoundTouchNodeType | null = null

  private isWorkletRegistered = false
  private activeSources: Set<AudioBufferSourceNode> = new Set()
  
  private constructor() {}

  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService()
    }
    return AudioService.instance
  }

  public async init(): Promise<AudioContext> {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      this.ctx = new AudioContextClass({ latencyHint: 'interactive' })
      console.debug('[AudioService] AudioContext creado.')
    }

    await this.initNodes()
    return this.ctx
  }

  private async initNodes(): Promise<void> {
    if (!this.ctx) return

    this.ensureMasterGain()
    this.ensureClickGain()
    await this.ensureSoundTouchNode()
  }

  private ensureMasterGain(): void {
    if (!this.ctx || this.outputGain) return

    this.outputGain = this.ctx.createGain()
    this.outputGain.connect(this.ctx.destination)
    this.outputGain.gain.value = 1
  }

  private ensureClickGain(): void {
    if (!this.ctx || this.clickGain) return

    this.clickGain = this.ctx.createGain()
    this.clickGain.connect(this.ctx.destination)
    this.clickGain.gain.value = 1
  }

  private async ensureSoundTouchNode(): Promise<void> {
    if (this.stNode) return

    try {
      if (!this.isWorkletRegistered) {
        console.debug('[AudioService] Registrando procesador SoundTouch desde /public...')
        const workletUrl = new URL('/soundtouch-processor.js', window.location.origin).href
        await this.ctx!.audioWorklet.addModule(workletUrl)
        this.isWorkletRegistered = true
        console.debug('[AudioService] AudioWorklet registrado con éxito.')
      }

      console.debug('[AudioService] Instanciando SoundTouchNode...')
      const soundTouch = new SoundTouchNode(this.ctx!)
      soundTouch.connect(this.outputGain!)

      soundTouch.tempo.value = 1
      soundTouch.pitch.value = 1
      soundTouch.pitchSemitones.value = 0
      soundTouch.playbackRate.value = 1

      this.stNode = soundTouch as unknown as SoundTouchNodeType
      console.debug('[AudioService] SoundTouchNode inicializado con éxito.')
    } catch (error) {
      errorReporter.record('audio-service', 'Failed to initialize SoundTouchNode', error)
      console.error('[AudioService] Error FATAL al inicializar SoundTouchNode:', error)
      this.stNode = null
    }
  }

  public createSource(
    buffer: AudioBuffer, 
    target: 'music' | 'click' | 'master' = 'music'
  ): AudioBufferSourceNode | null {
    if (!this.ctx) return null

    try {
      const source = this.ctx.createBufferSource()
      source.buffer = buffer

      if (target === 'music' && this.stNode) {
        source.connect(this.stNode as unknown as AudioNode)
      } else if (target === 'click' && this.clickGain) {
        source.connect(this.clickGain)
      } else if (this.outputGain) {
        source.connect(this.outputGain)
      } else {
        source.connect(this.ctx.destination)
      }

      this.activeSources.add(source)

      source.onended = () => {
        this.activeSources.delete(source)
        source.disconnect()
      }

      return source
    } catch (error) {
      errorReporter.record('audio-service', 'Failed to create audio source', error)
      console.error('[AudioService] Error al crear el AudioBufferSourceNode:', error)
      return null
    }
  }

  public dispose(): void {
    if (this.outputGain) {
      this.outputGain.disconnect()
      this.outputGain = null
    }

    if (this.clickGain) {
      this.clickGain.disconnect()
      this.clickGain = null
    }

    this.stopAll()
    this.stNode = null
  }
  public stopAll(): void {
    this.activeSources.forEach((source) => {
      try { source.stop() } catch (_) {}
      try { source.disconnect() } catch (_) {}
    })
    this.activeSources.clear()
  }

  public setVolume(volume: number): void {
    if (this.outputGain) {
      this.outputGain.gain.value = Math.max(0, Math.min(1, volume))
    }
  }

  public setClickVolume(volume: number): void {
    if (this.clickGain) {
      this.clickGain.gain.value = Math.max(0, Math.min(1, volume))
    }
  }

  public setPitch(semitones: number): void {
    if (!this.stNode) return
    this.stNode.pitchSemitones.value = semitones
    const ratio = Math.pow(2, semitones / 12)
    if ('pitch' in this.stNode) {
      (this.stNode as any).pitch.value = ratio
    }
  }

  public get context(): AudioContext | null { return this.ctx }

  public async resume(): Promise<void> {
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume()
    }
  }

  public async close(): Promise<void> {
    if (this.ctx) {
      await this.ctx.close()
      this.ctx = null
      this.outputGain = null
      this.clickGain = null
      this.stNode = null
      this.isWorkletRegistered = false
    }
  }

  public syncPlayback(offset: number, tracks: PlaybackRequest): boolean {
    if (!this.ctx) return false

    this.stopAll()
    const startOffset = Math.max(0, offset)
    const startTimeOnTimeline = this.ctx.currentTime
    const primaryTrackOffset = Math.max(0, tracks.primaryTrackOffset ?? 0)

    this.scheduleMainTrack(tracks.mainBuffer, startOffset, startTimeOnTimeline, primaryTrackOffset)
    this.scheduleClickTrack(tracks.clickBuffer, tracks.isClickEnabled, startOffset, startTimeOnTimeline, primaryTrackOffset)
    this.scheduleRecordedTracks(tracks.recordedTracks ?? [], startOffset, startTimeOnTimeline)
    this.scheduleRecordedTracks(tracks.clipTracks ?? [], startOffset, startTimeOnTimeline)
    this.scheduleRecordedTracks(tracks.stemTracks ?? [], startOffset, startTimeOnTimeline)

    return true
  }

  private scheduleMainTrack(buffer: AudioBuffer | null, offset: number, startTime: number, trackOffset: number): void {
    if (!buffer) return

    const source = this.createSource(buffer, 'music')
    if (!source) return

    const bufferOffset = Math.max(0, offset - trackOffset)
    if (bufferOffset < buffer.duration) {
      const delayInSeconds = Math.max(0, trackOffset - offset)
      source.start(startTime + delayInSeconds, bufferOffset)
    }
  }

  private scheduleClickTrack(buffer: AudioBuffer | null, enabled: boolean, offset: number, startTime: number, trackOffset: number): void {
    if (!enabled || !buffer) return

    const source = this.createSource(buffer, 'click')
    if (!source) return

    const bufferOffset = Math.max(0, offset - trackOffset)
    if (bufferOffset < buffer.duration) {
      const delayInSeconds = Math.max(0, trackOffset - offset)
      source.start(startTime + delayInSeconds, bufferOffset)
    }
  }

  private scheduleRecordedTracks(tracks: PlaybackTrack[], offset: number, startTime: number): void {
    tracks.forEach((track) => {
      if (!track.enabled || !track.buffer) return

      const absoluteTrackOffset = offset - track.offset
      const gainValue = Math.max(0, Math.min(1, track.gain ?? 1))
      const shouldApplyPitch = track.applyPitch ?? false

      if (absoluteTrackOffset >= 0 && absoluteTrackOffset < track.buffer.duration) {
        const source = this.createSource(track.buffer, shouldApplyPitch ? 'music' : 'master')
        if (source) {
          source.disconnect()
          const gainNode = this.ctx?.createGain() ?? null
          const targetNode = (shouldApplyPitch && this.stNode)
            ? this.stNode as unknown as AudioNode
            : (this.outputGain ?? this.ctx!.destination)
          if (gainNode) {
            gainNode.gain.value = gainValue
            gainNode.connect(targetNode)
            source.connect(gainNode)
          } else {
            source.connect(targetNode)
          }
          source.start(startTime, absoluteTrackOffset)
        }
      } else if (absoluteTrackOffset < 0) {
        const source = this.createSource(track.buffer, shouldApplyPitch ? 'music' : 'master')
        if (source) {
          source.disconnect()
          const gainNode = this.ctx?.createGain() ?? null
          const targetNode = (shouldApplyPitch && this.stNode)
            ? this.stNode as unknown as AudioNode
            : (this.outputGain ?? this.ctx!.destination)
          if (gainNode) {
            gainNode.gain.value = gainValue
            gainNode.connect(targetNode)
            source.connect(gainNode)
          } else {
            source.connect(targetNode)
          }
          const delayInSeconds = track.offset - offset
          source.start(startTime + delayInSeconds, 0)
        }
      }
    })
  }
}

export const audioService = AudioService.getInstance()