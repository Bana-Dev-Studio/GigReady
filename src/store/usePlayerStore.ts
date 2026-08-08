import { create } from 'zustand'
import { type PlayerState, type PlaybackMode } from '../types'

const initialTransportState = {
  mode: 'idle' as PlaybackMode,
  playheadSeconds: 0,
  durationSeconds: 0,
  isReady: false,
  offsetSeconds: 0,
}

export const usePlayerStore = create<PlayerState>((set) => ({
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  isReady: false,
  loadProgress: 0,
  transport: initialTransportState,

  setIsPlaying: (playing) => set((state) => ({
    isPlaying: playing,
    transport: {
      ...state.transport,
      mode: playing ? 'playing' : 'paused',
    },
  })),
  setCurrentTime: (time) => set((state) => ({
    currentTime: time,
    transport: {
      ...state.transport,
      playheadSeconds: time,
    },
  })),
  setDuration: (duration) => set((state) => ({
    duration,
    transport: {
      ...state.transport,
      durationSeconds: duration,
    },
  })),
  setIsReady: (ready) => set((state) => ({
    isReady: ready,
    transport: {
      ...state.transport,
      isReady: ready,
    },
  })),
  setLoadProgress: (loadProgress) => set({ loadProgress }),
  setPlaybackMode: (mode) => set((state) => ({
    transport: {
      ...state.transport,
      mode,
    },
  })),
  setPlayhead: (time) => set((state) => ({
    currentTime: time,
    transport: {
      ...state.transport,
      playheadSeconds: time,
    },
  })),
  setOffset: (offset) => set((state) => ({
    transport: {
      ...state.transport,
      offsetSeconds: offset,
    },
  })),
}))