/** A single search result, agnostic of source */
export type SearchResult = {
  id: string
  title: string
  description?: string
  image?: string
  category: string
  categoryKey: string
  score: number
  data: unknown
}

/** A search provider supplies results for a given query */
export type SearchProvider = {
  id: string
  search: (query: string) => SearchResult[]
}

/** Handler called when a result is selected */
export type SearchResultHandler = (result: SearchResult) => void
