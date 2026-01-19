import { context, trace, type Span, SpanStatusCode } from '@opentelemetry/api'
import { Resource } from '@opentelemetry/resources'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'

let isTelemetryEnabled = false

function resolveTelemetryConfig() {
  const rawEndpoint = process.env.GRAFANA_OTLP_ENDPOINT
  const token = process.env.GRAFANA_OTLP_TOKEN
  const customAuthHeader = process.env.GRAFANA_OTLP_AUTH_HEADER

  if (!rawEndpoint || !(token || customAuthHeader)) {
    return null
  }

  const trimmedEndpoint = rawEndpoint.replace(/\/+$/, '')
  const endpoint = trimmedEndpoint.endsWith('/otlp')
    ? `${trimmedEndpoint}/v1/traces`
    : trimmedEndpoint

  const headers: Record<string, string> = {}
  if (customAuthHeader) {
    headers.Authorization = customAuthHeader
  } else if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return { endpoint, headers }
}

export async function initializeTelemetry(): Promise<void> {
  const config = resolveTelemetryConfig()
  if (!config) {
    return
  }

  const serviceNamespace = process.env.OTEL_SERVICE_NAMESPACE
  const deploymentEnvironment = process.env.OTEL_DEPLOYMENT_ENVIRONMENT

  const exporter = new OTLPTraceExporter({
    url: config.endpoint,
    headers: config.headers,
  })

  const resourceAttributes: Record<string, string> = {
    'service.name': 'zukus-server',
  }

  if (serviceNamespace) {
    resourceAttributes['service.namespace'] = serviceNamespace
  }

  if (deploymentEnvironment) {
    resourceAttributes['deployment.environment'] = deploymentEnvironment
  }

  const sdk = new NodeSDK({
    resource: new Resource(resourceAttributes),
    traceExporter: exporter,
  })

  try {
    await sdk.start()
    isTelemetryEnabled = true
    console.log('Telemetry enabled for Grafana Cloud')

    await withSpan('server.startup', async (span) => {
      span.setAttribute('server.ready', true)
    })
  } catch (error) {
    console.warn('Telemetry initialization failed:', error)
  }
}

export async function withSpan<T>(name: string, fn: (span: Span) => Promise<T>): Promise<T> {
  if (!isTelemetryEnabled) {
    const span = trace.getTracer('zukus-server').startSpan(name)
    try {
      return await fn(span)
    } finally {
      span.end()
    }
  }

  const tracer = trace.getTracer('zukus-server')
  return tracer.startActiveSpan(name, async (span) => {
    try {
      return await fn(span)
    } catch (error) {
      span.recordException(error as Error)
      span.setStatus({ code: SpanStatusCode.ERROR })
      throw error
    } finally {
      span.end()
    }
  })
}

export function addSpanAttribute(key: string, value: string | number | boolean): void {
  const span = trace.getSpan(context.active())
  if (!span) return
  span.setAttribute(key, value)
}
