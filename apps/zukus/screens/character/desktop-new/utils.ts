/**
 * Returns a label for CGE entity type (localized).
 */
export function getCGELabel(entityType: string): string {
  const labels: Record<string, string> = {
    spell: 'Conjuros',
    power: 'Poderes',
    maneuver: 'Maniobras',
    invocation: 'Invocaciones',
  }
  return labels[entityType] ?? 'Habilidades'
}
