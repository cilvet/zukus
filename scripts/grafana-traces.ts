type GrafanaDataSource = {
  id: number
  uid: string
  name: string
  type: string
}

type TraceSearchResult = {
  traceID?: string
  traceId?: string
  rootTraceName?: string
  startTimeUnixNano?: string
  durationMs?: number
}

type TraceBatch = {
  instrumentationLibrarySpans?: { spans?: TraceSpan[] }[]
  scopeSpans?: { spans?: TraceSpan[] }[]
}

type TraceSpan = {
  name?: string
  startTimeUnixNano?: string
  endTimeUnixNano?: string
}

type TraceResponse = {
  batches?: TraceBatch[]
}

function getEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing env var ${name}`)
  }
  return value
}

function getOptionalNumber(name: string, fallback: number): number {
  const raw = process.env[name]
  if (!raw) return fallback
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : fallback
}

function withTrailingSlashRemoved(url: string): string {
  return url.replace(/\/+$/, '')
}

function toUnixSeconds(date: Date): string {
  return String(Math.floor(date.getTime() / 1000))
}

async function grafanaFetch(baseUrl: string, path: string, apiKey: string, init?: RequestInit) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Grafana request failed (${response.status}): ${text}`)
  }

  return response.json()
}

async function getDataSource(baseUrl: string, apiKey: string, name: string): Promise<GrafanaDataSource> {
  const encoded = encodeURIComponent(name)
  return grafanaFetch(baseUrl, `/api/datasources/name/${encoded}`, apiKey)
}

async function searchTraces(
  baseUrl: string,
  apiKey: string,
  dataSourceId: number,
  serviceName: string,
  start: string,
  end: string,
  limit: number,
): Promise<TraceSearchResult[]> {
  const basePath = `/api/datasources/proxy/${dataSourceId}/api/search`
  const query = encodeURIComponent(`{ resource.service.name = "${serviceName}" }`)
  const queryUrl = `${basePath}?query=${query}&start=${start}&end=${end}&limit=${limit}`

  try {
    const response = await grafanaFetch(baseUrl, queryUrl, apiKey)
    const traces = (response.traces ?? response.data?.traces ?? response.data ?? []) as TraceSearchResult[]
    return traces
  } catch (error) {
    const tags = encodeURIComponent(`service.name=${serviceName}`)
    const tagUrl = `${basePath}?tags=${tags}&start=${start}&end=${end}&limit=${limit}`
    const response = await grafanaFetch(baseUrl, tagUrl, apiKey)
    const traces = (response.traces ?? response.data?.traces ?? response.data ?? []) as TraceSearchResult[]
    return traces
  }
}

async function fetchTrace(
  baseUrl: string,
  apiKey: string,
  dataSourceId: number,
  traceId: string,
): Promise<TraceResponse> {
  const path = `/api/datasources/proxy/${dataSourceId}/api/traces/${traceId}`
  return grafanaFetch(baseUrl, path, apiKey)
}

function getSpanDurationMs(span: TraceSpan): number | null {
  if (!span.startTimeUnixNano || !span.endTimeUnixNano) return null
  const start = Number(span.startTimeUnixNano)
  const end = Number(span.endTimeUnixNano)
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null
  return (end - start) / 1_000_000
}

function collectSpans(trace: TraceResponse): TraceSpan[] {
  const batches = trace.batches ?? []
  const spans: TraceSpan[] = []

  for (const batch of batches) {
    const legacy = batch.instrumentationLibrarySpans ?? []
    for (const scope of legacy) {
      spans.push(...(scope.spans ?? []))
    }

    const scopes = batch.scopeSpans ?? []
    for (const scope of scopes) {
      spans.push(...(scope.spans ?? []))
    }
  }

  return spans
}

function summarizeTrace(traceId: string, spans: TraceSpan[]) {
  const targetNames = [
    'http.GET /characters',
    'supabase.auth.getUser',
    'supabase.characters.list',
  ]

  const durations: Record<string, number | null> = {}
  for (const name of targetNames) {
    const match = spans.find((span) => span.name === name)
    durations[name] = match ? getSpanDurationMs(match) : null
  }

  const total = durations['http.GET /characters']
  return {
    traceId,
    totalMs: total,
    authMs: durations['supabase.auth.getUser'],
    queryMs: durations['supabase.characters.list'],
  }
}

async function main() {
  const baseUrl = withTrailingSlashRemoved(getEnv('GRAFANA_URL'))
  const apiKey = getEnv('GRAFANA_API_KEY')
  const dataSourceName = getEnv('GRAFANA_TEMPO_DATASOURCE')
  const serviceName = process.env.TRACE_SERVICE_NAME || 'zukus-server'
  const lookbackMinutes = getOptionalNumber('TRACE_LOOKBACK_MINUTES', 15)
  const limit = getOptionalNumber('TRACE_LIMIT', 20)

  const dataSource = await getDataSource(baseUrl, apiKey, dataSourceName)
  const end = new Date()
  const start = new Date(end.getTime() - lookbackMinutes * 60 * 1000)

  const traces = await searchTraces(
    baseUrl,
    apiKey,
    dataSource.id,
    serviceName,
    toUnixSeconds(start),
    toUnixSeconds(end),
    limit,
  )

  if (traces.length === 0) {
    console.log('No traces found.')
    return
  }

  const summaries = [] as { traceId: string; totalMs: number | null; authMs: number | null; queryMs: number | null }[]

  for (const trace of traces) {
    const traceId = trace.traceID ?? trace.traceId
    if (!traceId) continue

    const traceData = await fetchTrace(baseUrl, apiKey, dataSource.id, traceId)
    const spans = collectSpans(traceData)
    summaries.push(summarizeTrace(traceId, spans))
  }

  summaries.sort((a, b) => (b.totalMs ?? 0) - (a.totalMs ?? 0))

  console.log(`Traces for service "${serviceName}" (last ${lookbackMinutes}m):`)
  for (const summary of summaries) {
    const total = summary.totalMs !== null ? `${summary.totalMs.toFixed(1)}ms` : 'n/a'
    const auth = summary.authMs !== null ? `${summary.authMs.toFixed(1)}ms` : 'n/a'
    const query = summary.queryMs !== null ? `${summary.queryMs.toFixed(1)}ms` : 'n/a'
    console.log(`${summary.traceId} | total: ${total} | auth: ${auth} | query: ${query}`)
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
