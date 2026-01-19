import type { CharacterListItem } from './characterRepository'
import { getServerBaseUrl } from './serverBaseUrl'

export async function listCharactersFromServer(accessToken: string): Promise<CharacterListItem[]> {
  const response = await fetch(`${getServerBaseUrl()}/characters`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    const message = payload?.error || `Error al cargar personajes (${response.status})`
    throw new Error(message)
  }

  const payload = (await response.json()) as { data?: CharacterListItem[] }
  return payload.data ?? []
}
