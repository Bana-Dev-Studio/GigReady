import { useEffect, useRef, useState } from 'react'

type RecorderHook = {
  isRecording: boolean
  startRecording: () => Promise<void>
  stopRecording: () => void
  recordedUrl: string | null
  recordedBlob: Blob | null
  clearRecording: () => void
}

export default function useRecorder(): RecorderHook {
  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const recordedUrlRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      // cleanup
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try { mediaRecorderRef.current.stop() } catch {}
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
      if (recordedUrlRef.current) {
        URL.revokeObjectURL(recordedUrlRef.current)
        recordedUrlRef.current = null
      }
    }
  }, [])

  async function startRecording() {
    if (isRecording) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const options: MediaRecorderOptions = {}
      // prefer webm if available
      // @ts-ignore
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported('audio/webm')) {
        // @ts-ignore
        options.mimeType = 'audio/webm'
      }
      const mr = new MediaRecorder(stream, options)
      mediaRecorderRef.current = mr
      chunksRef.current = []
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data)
      }
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: chunksRef.current[0]?.type || 'audio/webm' })
        setRecordedBlob(blob)
        if (recordedUrlRef.current) {
          URL.revokeObjectURL(recordedUrlRef.current)
        }
        const url = URL.createObjectURL(blob)
        recordedUrlRef.current = url
        setRecordedUrl(url)
      }
      mr.start()
      setIsRecording(true)
    } catch (err) {
      console.error('Error starting recording', err)
      throw err
    }
  }

  function stopRecording() {
    if (!isRecording) return
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
    } finally {
      setIsRecording(false)
    }
  }

  function clearRecording() {
    if (recordedUrlRef.current) {
      URL.revokeObjectURL(recordedUrlRef.current)
      recordedUrlRef.current = null
    }
    setRecordedUrl(null)
    setRecordedBlob(null)
  }

  return {
    isRecording,
    startRecording,
    stopRecording,
    recordedUrl,
    recordedBlob,
    clearRecording,
  }
}
