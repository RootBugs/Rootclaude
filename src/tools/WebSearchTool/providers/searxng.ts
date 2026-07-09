import type { SearchInput, SearchProvider } from './types.js'
import { applyDomainFilters, type ProviderOutput, type SearchHit } from './types.js'
import {
  isWebSearchTimeoutError,
  toAbortError,
  withWebSearchTimeout,
} from './timeout.js'

/**
 * SearXNG-based search provider.
 * Uses public SearXNG instances as a free, rate-limit-friendly alternative
 * to DuckDuckGo scraping.
 */

const SEARXNG_INSTANCES = [
  'https://search.inetol.net',
  'https://searx.be',
  'https://search.sapti.me',
  'https://searxng.ca',
  'https://search.ononoki.org',
]

function extractHits(data: any): SearchHit[] {
  const hits: SearchHit[] = []
  if (data?.results && Array.isArray(data.results)) {
    for (const result of data.results.slice(0, 10)) {
      if (result.url && result.title) {
        hits.push({
          title: result.title,
          url: result.url,
          snippet: result.content || '',
        })
      }
    }
  }
  return hits
}

export const searxngProvider: SearchProvider = {
  name: 'searxng',

  isConfigured() {
    // SearXNG is always available as a fallback
    return true
  },

  async search(input: SearchInput, signal?: AbortSignal): Promise<ProviderOutput> {
    const start = performance.now()

    for (const instance of SEARXNG_INSTANCES) {
      try {
        const params = new URLSearchParams({
          q: input.query,
          format: 'json',
          categories: 'general',
          language: 'en',
        })

        const url = `${instance}/search?${params.toString()}`

        const response = await withWebSearchTimeout(
          async (innerSignal: AbortSignal) => {
            const res = await fetch(url, {
              signal: innerSignal,
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
              },
            })

            if (!res.ok) {
              throw new Error(`HTTP ${res.status}`)
            }

            return res.json()
          },
          signal,
        )

        const hits = extractHits(response)
        const filteredHits = applyDomainFilters(hits, input)

        if (filteredHits.length > 0) {
          return {
            hits: filteredHits,
            provider: 'searxng',
            durationMs: performance.now() - start,
          }
        }
      } catch (error) {
        // Try next instance
        continue
      }
    }

    // All instances failed
    throw new Error(
      'SearXNG search failed. All public instances are unavailable.',
    )
  },
}
