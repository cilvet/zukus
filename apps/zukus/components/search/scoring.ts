/**
 * Scores how well a query matches a piece of text.
 * Returns the highest applicable score (case-insensitive).
 *
 * Scoring tiers:
 * - 100: Exact name match
 * -  80: Name starts with query
 * -  60: Name contains query at a word boundary
 * -  40: Name contains query anywhere
 * -  20: Description contains query
 * -  15: Tag match
 * -   0: No match
 */
export function scoreMatch(
  query: string,
  name: string,
  description?: string,
  tags?: string[],
): number {
  const q = query.toLowerCase().trim()
  if (q.length === 0) return 0

  const lowerName = name.toLowerCase()

  // Exact name match
  if (lowerName === q) return 100

  // Name starts with query
  if (lowerName.startsWith(q)) return 80

  // Name contains query at a word boundary
  const wordBoundaryPattern = new RegExp(`\\b${escapeRegex(q)}`)
  if (wordBoundaryPattern.test(lowerName)) return 60

  // Name contains query anywhere
  if (lowerName.includes(q)) return 40

  // Description contains query
  if (description && description.toLowerCase().includes(q)) return 20

  // Tag match
  if (tags && tags.some((tag) => tag.toLowerCase().includes(q))) return 15

  return 0
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
