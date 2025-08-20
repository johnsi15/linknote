import { useMutation, useQuery } from '@tanstack/react-query'

interface SimilarTag {
  tagId: string
  tagName: string
  similarity: number
}

interface TagEmbeddingResponse {
  success: boolean
  message?: string
  tagId?: string
  tagName?: string
  error?: string
}

interface SimilarTagsResponse {
  success: boolean
  query?: string
  similarTags?: SimilarTag[]
  total?: number
  error?: string
}

// Generar embedding para un tag
async function generateTagEmbedding(tagId: string, tagName: string): Promise<TagEmbeddingResponse> {
  const res = await fetch('/api/tags/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tagId, tagName }),
  })

  return await res.json()
}

// Buscar tags similares
async function findSimilarTags(tagName: string, limit: number = 5): Promise<SimilarTagsResponse> {
  const params = new URLSearchParams({
    tagName,
    limit: limit.toString(),
  })

  const res = await fetch(`/api/tags/embeddings?${params}`)
  return await res.json()
}

// Hook para generar embedding de un tag
export function useGenerateTagEmbedding() {
  return useMutation({
    mutationFn: ({ tagId, tagName }: { tagId: string; tagName: string }) =>
      generateTagEmbedding(tagId, tagName),
    onSuccess: (data) => {
      if (!data.success && data.error) {
        throw new Error(data.error)
      }
    },
  })
}

// Hook para buscar tags similares
export function useSimilarTags(tagName: string, limit: number = 5, enabled: boolean = true) {
  return useQuery({
    queryKey: ['similarTags', tagName, limit],
    queryFn: () => findSimilarTags(tagName, limit),
    enabled: enabled && tagName.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutos
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || 'Failed to find similar tags')
      }
      return data.similarTags || []
    },
  })
}

// Hook para buscar tags similares de forma "lazy" (solo cuando se llame)
export function useLazySimilarTags() {
  return useMutation({
    mutationFn: ({ tagName, limit = 5 }: { tagName: string; limit?: number }) =>
      findSimilarTags(tagName, limit),
    onSuccess: (data) => {
      if (!data.success && data.error) {
        throw new Error(data.error)
      }
    },
  })
}

export type { SimilarTag }
