import { errorReporter } from './ErrorReporter'

export type FeedbackLevel = 'info' | 'warning'

export type FeedbackRecoveryAction = 'retry-upload' | 'retry-playback' | 'dismiss'

export type FeedbackNotice = {
  level: FeedbackLevel
  title: string
  message: string
  recoveryAction: FeedbackRecoveryAction
  recoveryLabel: string
}

export function buildFeedbackNotice(scope: string, message: string): FeedbackNotice {
  if (scope === 'audio-load') {
    return {
      level: 'warning',
      title: 'No se pudo cargar la pista',
      message: `La pista no está disponible ahora, pero puedes reintentar o seguir con la sesión. ${message}`,
      recoveryAction: 'retry-upload',
      recoveryLabel: 'Reintentar carga',
    }
  }

  return {
    level: 'warning',
    title: 'Playback con aviso',
    message: `El audio pudo quedar limitado, pero la sesión puede seguir funcionando. ${message}`,
    recoveryAction: 'retry-playback',
    recoveryLabel: 'Reintentar reproducción',
  }
}

export function buildFeedbackNoticeWithTelemetry(scope: string, message: string): FeedbackNotice {
  const notice = buildFeedbackNotice(scope, message)
  errorReporter.recordMetric('fallback', 'notice-issued', 1, {
    scope,
    recoveryAction: notice.recoveryAction,
    recoveryLabel: notice.recoveryLabel,
  })
  return notice
}
