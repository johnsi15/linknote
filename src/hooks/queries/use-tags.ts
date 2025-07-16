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
      const response = await fetch('/api/tags')
      if (!response.ok) throw new Error('Error fetching tags')
      
      const data = await response.json()
      return { tags: data.tags, total: data.total }
    },
    staleTime: 1000 * 60 * 10, // 10 minutos para tags (cambian menos)
  })
}

// Hook para tags populares
export function usePopularTags(limit = 10) {
  return useQuery({
    queryKey: [...tagKeys.popular(), { limit }],
    queryFn: async (): Promise<Tag[]> => {
      const response = await fetch('/api/tags')
      if (!response.ok) throw new Error('Error fetching tags')
      
      const data = await response.json()
      // Ordenar por count y tomar los primeros `limit`
      return data.tags
        .sort((a: Tag, b: Tag) => (b.count || 0) - (a.count || 0))
        .slice(0, limit)
    },
    staleTime: 1000 * 60 * 15, // 15 minutos para tags populares
  })
}

// Hook para buscar tags por nombre
export function useTagsSearch(search?: string) {
  return useQuery({
    queryKey: tagKeys.list({ search }),
    queryFn: async (): Promise<Tag[]> => {
      if (!search || search.trim() === '') {
        return []
      }

      const response = await fetch('/api/tags')
      if (!response.ok) throw new Error('Error fetching tags')
      
      const data = await response.json()
      return data.tags.filter((tag: Tag) => tag.name.toLowerCase().includes(search.toLowerCase()))
    },
    staleTime: 1000 * 60 * 5, // 5 minutos para búsquedas
    enabled: search !== undefined,
  })
}

// Función de prefetch para tags
export function prefetchTags(filters?: { search?: string }) {
  return queryClient.prefetchQuery({
    queryKey: tagKeys.list(filters || {}),
    queryFn: async (): Promise<TagsResponse> => {
      const response = await fetch('/api/tags')
      if (!response.ok) throw new Error('Error fetching tags')
      
      const data = await response.json()
      return { tags: data.tags, total: data.total }
    },
    staleTime: 1000 * 60 * 10,
  })
}

// Función de prefetch para tags populares
export function prefetchPopularTags(limit = 10) {
  return queryClient.prefetchQuery({
    queryKey: [...tagKeys.popular(), { limit }],
    queryFn: async (): Promise<Tag[]> => {
      // const tags = await getUserTags()

      const tags: Tag[] = []

      return tags.sort((a, b) => b.count - a.count).slice(0, limit)
    },
    staleTime: 1000 * 60 * 15,
  })
}
