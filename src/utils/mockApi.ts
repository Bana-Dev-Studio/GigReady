import { normalizeBeatAnalysisResponse, type ApiBeatAnalysisResponse, type ApiBeatMarker } from '../types/contracts'

export type BeatMarker = ApiBeatMarker
export type BeatAnalysis = ApiBeatAnalysisResponse

export async function fetchBeatAnalysisMock(): Promise<BeatAnalysis> {
  const res = await fetch('/api/mock-beats-120bpm.json')
  if (!res.ok) throw new Error('Mock API fetch failed')
  const data: unknown = await res.json()
  return normalizeBeatAnalysisResponse(data)
}
