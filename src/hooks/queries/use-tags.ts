import { useQuery } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { Tag } from '@/types/tag'

interface TagsResponse {
  tags: Tag[]
  total: number
}

// Query keys
export const tagKeys = {
  all: ['tags'] as const,
  lists: () => [...tagKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...tagKeys.lists(), { filters }] as const,
  popular: () => [...tagKeys.all, 'popular'] as const,
}

// Hook para obtener todos los tags
export function useTags(filters?: { search?: string }) {
  return useQuery({
    queryKey: tagKeys.list(filters || {}),
    queryFn: async (): Promise<TagsResponse> => {
      const params = new URLSearchParams()
      if (filters?.search) params.append('search', filters.search)

      const response = await fetch(`/api/tags?${params}`)
      if (!response.ok) throw new Error('Error fetching tags')
      return response.json()
    },
    staleTime: 1000 * 60 * 10, // 10 minutos para tags (cambian menos)
  })
}

// Hook para tags populares
export function usePopularTags(limit = 10) {
  return useQuery({
    queryKey: [...tagKeys.popular(), { limit }],
    queryFn: async (): Promise<Tag[]> => {
      const response = await fetch(`/api/tags/popular?limit=${limit}`)
      if (!response.ok) throw new Error('Error fetching popular tags')
      return response.json()
    },
    staleTime: 1000 * 60 * 15, // 15 minutos para tags populares
  })
}

// Función de prefetch para tags
export function prefetchTags(filters?: { search?: string }) {
  return queryClient.prefetchQuery({
    queryKey: tagKeys.list(filters || {}),
    queryFn: async (): Promise<TagsResponse> => {
      const params = new URLSearchParams()
      if (filters?.search) params.append('search', filters.search)

      const response = await fetch(`/api/tags?${params}`)
      if (!response.ok) throw new Error('Error fetching tags')
      return response.json()
    },
    staleTime: 1000 * 60 * 10,
  })
}

// Función de prefetch para tags populares
export function prefetchPopularTags(limit = 10) {
  return queryClient.prefetchQuery({
    queryKey: [...tagKeys.popular(), { limit }],
    queryFn: async (): Promise<Tag[]> => {
      const response = await fetch(`/api/tags/popular?limit=${limit}`)
      if (!response.ok) throw new Error('Error fetching popular tags')
      return response.json()
    },
    staleTime: 1000 * 60 * 15,
  })
}
