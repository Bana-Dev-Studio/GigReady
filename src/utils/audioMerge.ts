export async function mixAudioBuffers(
  buffers: AudioBuffer[],
  sampleRate?: number,
  gains?: number[],
  offsets?: number[] // offsets in seconds for each buffer
) {
  if (buffers.length === 0) {
    throw new Error('No buffers provided for mixing')
  }

  const rate = sampleRate ?? buffers[0].sampleRate
  const maxChannels = buffers.reduce((max, buffer) => Math.max(max, buffer.numberOfChannels), 1)

  // compute max duration including offsets
  const maxDuration = Math.max(...buffers.map((buffer, idx) => (offsets?.[idx] ?? 0) + buffer.duration))
  const length = Math.ceil(maxDuration * rate)

  const offlineCtx = new OfflineAudioContext(maxChannels, length, rate)

  buffers.forEach((buffer, idx) => {
    const source = offlineCtx.createBufferSource()
    source.buffer = buffer

    const gain = gains?.[idx] ?? 1
    if (gain !== 1) {
      const gainNode = offlineCtx.createGain()
      gainNode.gain.value = gain
      source.connect(gainNode)
      gainNode.connect(offlineCtx.destination)
    } else {
      source.connect(offlineCtx.destination)
    }

    const startAt = offsets?.[idx] ?? 0
    source.start(startAt)
  })

  return offlineCtx.startRendering()
}
