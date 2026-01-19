import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export type EnvMap = Record<string, string>

function stripQuotes(value: string): string {
  if (value.length < 2) return value
  const first = value[0]
  const last = value[value.length - 1]
  if (first === '"' && last === '"') return value.slice(1, -1)
  if (first === "'" && last === "'") return value.slice(1, -1)
  return value
}

function parseEnvFile(filePath: string): EnvMap {
  const content = readFileSync(filePath, 'utf8')
  const lines = content.split(/\r?\n/)
  const env: EnvMap = {}

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const equalsIndex = trimmed.indexOf('=')
    if (equalsIndex === -1) continue

    const key = trimmed.slice(0, equalsIndex).trim()
    const rawValue = trimmed.slice(equalsIndex + 1).trim()
    if (!key) continue

    env[key] = stripQuotes(rawValue)
  }

  return env
}

export function loadEnv(): EnvMap {
  const envPath = resolve(import.meta.dir, '../../../pruebaEnvironment.txt')
  const fileEnv = existsSync(envPath) ? parseEnvFile(envPath) : {}
  const mergedEnv: EnvMap = { ...fileEnv }

  for (const [key, value] of Object.entries(process.env)) {
    if (value !== undefined) {
      mergedEnv[key] = value
    }
  }

  return mergedEnv
}
