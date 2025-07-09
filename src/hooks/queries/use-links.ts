import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { Link } from '@/types/link'

interface LinksResponse {
  links: Link[]
  nextCursor?: string
  hasMore: boolean
  total: number
}

// Query keys
export const linkKeys = {
  all: ['links'] as const,
  lists: () => [...linkKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...linkKeys.lists(), { filters }] as const,
  details: () => [...linkKeys.all, 'detail'] as const,
  detail: (id: string) => [...linkKeys.details(), id] as const,
}

// Hook para obtener todos los links
export function useLinks(filters?: { tag?: string; search?: string }) {
  return useQuery({
    queryKey: linkKeys.list(filters || {}),
    queryFn: async (): Promise<LinksResponse> => {
      const params = new URLSearchParams()
      if (filters?.tag) params.append('tag', filters.tag)
      if (filters?.search) params.append('search', filters.search)

      const response = await fetch(`/api/links?${params}`)
      if (!response.ok) throw new Error('Error fetching links')
      return response.json()
    },
    staleTime: 1000 * 60 * 2, // 2 minutos para links
  })
}

// Hook para obtener un link específico
export function useLink(id: string) {
  return useQuery({
    queryKey: linkKeys.detail(id),
    queryFn: async (): Promise<Link> => {
      const response = await fetch(`/api/links/${id}`)
      if (!response.ok) throw new Error('Error fetching link')
      return response.json()
    },
    enabled: !!id,
  })
}

// Hook para paginación infinita
export function useInfiniteLinks(filters?: { tag?: string; search?: string }) {
  return useInfiniteQuery({
    queryKey: linkKeys.list(filters || {}),
    queryFn: async ({ pageParam }: { pageParam: string | undefined }): Promise<LinksResponse> => {
      const params = new URLSearchParams()
      if (filters?.tag) params.append('tag', filters.tag)
      if (filters?.search) params.append('search', filters.search)
      if (pageParam) params.append('cursor', pageParam as string)

      const response = await fetch(`/api/links?${params}`)
      if (!response.ok) throw new Error('Error fetching links')
      return response.json()
    },
    initialPageParam: undefined,
    getNextPageParam: lastPage => lastPage.nextCursor,
  })
}

// Función de prefetch para links
export function prefetchLinks(filters?: { tag?: string; search?: string }) {
  return queryClient.prefetchQuery({
    queryKey: linkKeys.list(filters || {}),
    queryFn: async (): Promise<LinksResponse> => {
      const params = new URLSearchParams()
      if (filters?.tag) params.append('tag', filters.tag)
      if (filters?.search) params.append('search', filters.search)

      const response = await fetch(`/api/links?${params}`)
      if (!response.ok) throw new Error('Error fetching links')
      return response.json()
    },
    staleTime: 1000 * 60 * 5,
  })
}
