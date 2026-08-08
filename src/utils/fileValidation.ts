const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/aac', 'audio/ogg']
const ALLOWED_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac']

export function validateAudioFile(file: File): { valid: boolean; error?: string } {
  // Validar tamaño
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Archivo demasiado grande. Máximo permitido: 50MB (tu archivo: ${(file.size / 1024 / 1024).toFixed(2)}MB)`,
    }
  }

  // Validar tipo MIME
  if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de archivo no soportado. Formatos permitidos: ${ALLOWED_EXTENSIONS.join(', ')}`,
    }
  }

  // Validar extensión
  const fileName = file.name.toLowerCase()
  const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext))

  if (!hasValidExtension) {
    return {
      valid: false,
      error: `Extensión no válida. Formatos permitidos: ${ALLOWED_EXTENSIONS.join(', ')}`,
    }
  }

  return { valid: true }
}

export function sanitizeFileName(name: string): string {
  return (
    name
      // Remover caracteres peligrosos y caracteres especiales
      .replace(/[<>:"'&]/g, '')
      // Solo permitir alfanuméricos, espacios, puntos y guiones
      .replace(/[^\w\s.-]/g, '')
      // Remover espacios múltiples
      .replace(/\s+/g, ' ')
      // Remover puntos/guiones al inicio
      .replace(/^[\s.-]+/, '')
      // Limitar longitud
      .substring(0, 100)
      .trim()
  )
}

export function createObjectUrlWithCleanup(
  file: File,
): {
  url: string
  cleanup: () => void
} {
  const url = URL.createObjectURL(file)

  return {
    url,
    cleanup: () => {
      URL.revokeObjectURL(url)
    },
  }
}
