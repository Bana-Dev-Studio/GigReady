export type ResourceStatus = 'idle' | 'loading' | 'ready' | 'error' | 'disposed'

export type ErrorEvent = {
  scope: string
  message: string
  detail?: unknown
  timestamp: string
}

export type MetricEvent = {
  scope: string
  metric: string
  value?: number
  detail?: unknown
  timestamp: string
}

export class ErrorReporter {
  private static instance: ErrorReporter | null = null
  private readonly events: ErrorEvent[] = []
  private readonly metrics: MetricEvent[] = []

  private constructor() {}

  public static getInstance(): ErrorReporter {
    if (!ErrorReporter.instance) {
      ErrorReporter.instance = new ErrorReporter()
    }
    return ErrorReporter.instance
  }

  public record(scope: string, message: string, detail?: unknown): void {
    const event: ErrorEvent = {
      scope,
      message,
      detail,
      timestamp: new Date().toISOString(),
    }

    this.events.push(event)
    console.debug(`[${scope}] ${message}`, detail)
  }

  public getEvents(): ErrorEvent[] {
    return [...this.events]
  }

  public recordMetric(scope: string, metric: string, value?: number, detail?: unknown): void {
    const event: MetricEvent = {
      scope,
      metric,
      value,
      detail,
      timestamp: new Date().toISOString(),
    }

    this.metrics.push(event)
    console.debug(`[${scope}] metric:${metric}`, { value, detail })
  }

  public getMetrics(): MetricEvent[] {
    return [...this.metrics]
  }

  public clear(): void {
    this.events.length = 0
    this.metrics.length = 0
  }
}

export const errorReporter = ErrorReporter.getInstance()
