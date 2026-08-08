// Simple test audio generator
// Generates a test audio file with known BPM for testing

async function generateTestAudio() {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  const sampleRate = audioContext.sampleRate
  const duration = 30 // 30 segundos

  // Create offline context for rendering
  const offlineContext = new OfflineAudioContext(2, sampleRate * duration, sampleRate)

  // Generate tone at 440 Hz
  const osc = offlineContext.createOscillator()
  const gain = offlineContext.createGain()

  osc.frequency.value = 440 // A4
  osc.type = 'sine'

  gain.gain.setValueAtTime(0.1, 0)
  gain.gain.setValueAtTime(0.1, offlineContext.length / sampleRate - 1)
  gain.gain.linearRampToValueAtTime(0, offlineContext.length / sampleRate)

  osc.connect(gain)
  gain.connect(offlineContext.destination)

  osc.start(0)
  osc.stop(offlineContext.length / sampleRate)

  const audioBuffer = await offlineContext.startRendering()

  // Convert to WAV
  const wav = audioBufferToWav(audioBuffer)
  const blob = new Blob([wav], { type: 'audio/wav' })
  const url = URL.createObjectURL(blob)

  return url
}

function audioBufferToWav(audioBuffer: AudioBuffer): ArrayBuffer {
  const numberOfChannels = audioBuffer.numberOfChannels
  const sampleRate = audioBuffer.sampleRate
  const format = 1 // PCM
  const bitDepth = 16

  const bytesPerSample = bitDepth / 8
  const blockAlign = numberOfChannels * bytesPerSample

  let offset = 0
  let pos = 0

  const setUint16 = (data: DataView, pos: number, value: number) => {
    data.setUint16(pos, value, true)
  }

  const setUint32 = (data: DataView, pos: number, value: number) => {
    data.setUint32(pos, value, true)
  }

  const interleave = (inputL: Float32Array, inputR: Float32Array) => {
    const output = new Float32Array(inputL.length + inputR.length)
    let index = 0
    let inputIndex = 0

    while (index < output.length) {
      output[index++] = inputL[inputIndex]
      output[index++] = inputR[inputIndex]
      inputIndex++
    }
    return output
  }

  const writeFloat32 = (output: Float32Array, offset: number, input: Float32Array) => {
    for (let i = 0; i < input.length; i++, offset += 4) {
      const s = Math.max(-1, Math.min(1, input[i]))
      output[offset | 0] = s < 0 ? s * 0x8000 : s * 0x7fff
    }
  }

  const encodeWAV = (samples: Float32Array, sampleRate: number, numChannels: number, length: number) => {
    const buffer = new ArrayBuffer(44 + length * 2)
    const view = new DataView(buffer)

    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }

    // WAV header
    writeString(0, 'RIFF')
    setUint32(view, 4, 36 + length * numChannels * 2)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    setUint32(view, 16, 16)
    setUint16(view, 20, 1)
    setUint16(view, 22, numChannels)
    setUint32(view, 24, sampleRate)
    setUint32(view, 28, sampleRate * 2 * numChannels)
    setUint16(view, 32, numChannels * 2)
    setUint16(view, 34, 16)
    writeString(36, 'data')
    setUint32(view, 40, length * numChannels * 2)

    // Write audio data
    const volume = 0.8
    let index = 44
    for (let i = 0; i < length; i++) {
      const s = Math.max(-1, Math.min(1, samples[i] * volume))
      view.setInt16(index, s < 0 ? s * 0x8000 : s * 0x7fff, true)
      index += 2
    }

    return buffer
  }

  const channels = []
  for (let i = 0; i < numberOfChannels; i++) {
    channels.push(audioBuffer.getChannelData(i))
  }

  let merged: Float32Array
  if (numberOfChannels === 2) {
    merged = interleave(channels[0], channels[1])
  } else {
    merged = channels[0]
  }

  return encodeWAV(merged, sampleRate, numberOfChannels, audioBuffer.length)
}

export async function downloadTestAudio() {
  try {
    const url = await generateTestAudio()
    const a = document.createElement('a')
    a.href = url
    a.download = 'test-audio.wav'
    a.click()
  } catch (error) {
    console.error('Error generating test audio:', error)
  }
}
