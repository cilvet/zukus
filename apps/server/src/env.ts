export type EnvMap = Record<string, string>

export function loadEnv(): EnvMap {
  const mergedEnv: EnvMap = {}

  for (const [key, value] of Object.entries(process.env)) {
    if (value !== undefined) {
      mergedEnv[key] = value
    }
  }

  return mergedEnv
}
