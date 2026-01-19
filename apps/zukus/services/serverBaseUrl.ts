export function getServerBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SERVER || 'https://zukus-server.fly.dev'
}
