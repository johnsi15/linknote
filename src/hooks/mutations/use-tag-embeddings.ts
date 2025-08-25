import { useQuery } from '@tanstack/react-query'

interface SimilarTag {
  tagId: string
  tagName: string
  similarity: number
}

interface SimilarTagsResponse {
  success: boolean
  query?: string
  similarTags?: SimilarTag[]
  total?: number
  error?: string
}

// Query keys para tags similares
export const similarTagsKeys = {
  all: ['similarTags'] as const,
  byName: (tagName: string, limit: number) => [...similarTagsKeys.all, tagName, limit] as const,
}

// Buscar tags similares
async function findSimilarTags(tagName: string, limit: number = 5): Promise<SimilarTagsResponse> {
  const params = new URLSearchParams({
    tagName,
    limit: limit.toString(),
  })

  const res = await fetch(`/api/tags/embeddings?${params}`)
  
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`)
  }

  return await res.json()
}

// Hook para buscar tags similares (ÚNICA OPCIÓN RECOMENDADA)
export function useSimilarTags(tagName: string, limit: number = 5, enabled: boolean = true) {
  return useQuery({
    queryKey: similarTagsKeys.byName(tagName, limit),
    queryFn: () => findSimilarTags(tagName, limit),
    enabled: enabled && tagName.length > 1,
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    select: data => {
      if (!data.success) {
        throw new Error(data.error || 'Failed to find similar tags')
      }
      return data.similarTags || []
    },
  })
}

export type { SimilarTag }
