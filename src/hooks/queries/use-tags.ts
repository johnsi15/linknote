import { useQuery } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { getUserTags } from '@/actions/tags'
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
      const tags = await getUserTags()

      return { tags, total: tags.length }
    },
    staleTime: 1000 * 60 * 10, // 10 minutos para tags (cambian menos)
  })
}

// Hook para tags populares
export function usePopularTags(limit = 10) {
  return useQuery({
    queryKey: [...tagKeys.popular(), { limit }],
    queryFn: async (): Promise<Tag[]> => {
      const tags = await getUserTags()

      return tags.sort((a, b) => b.count - a.count).slice(0, limit)
    },
    staleTime: 1000 * 60 * 15, // 15 minutos para tags populares
  })
}

// Hook para buscar tags por nombre
export function useTagsSearch(search?: string) {
  return useQuery({
    queryKey: tagKeys.list({ search }),
    queryFn: async (): Promise<Tag[]> => {
      const tags = await getUserTags()

      if (!search || search.trim() === '') {
        return tags
      }

      return tags.filter(tag => tag.name.toLowerCase().includes(search.toLowerCase()))
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
      const tags = await getUserTags()

      return { tags, total: tags.length }
    },
    staleTime: 1000 * 60 * 10,
  })
}

// Función de prefetch para tags populares
export function prefetchPopularTags(limit = 10) {
  return queryClient.prefetchQuery({
    queryKey: [...tagKeys.popular(), { limit }],
    queryFn: async (): Promise<Tag[]> => {
      const tags = await getUserTags()

      return tags.sort((a, b) => b.count - a.count).slice(0, limit)
    },
    staleTime: 1000 * 60 * 15,
  })
}
