import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { Link } from '@/types/link'
import { getUserLinks, getLinkById } from '@/actions/links'

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
export function useLinks(filters?: { search?: string; tags?: string[]; dateRange?: string; sort?: string }) {
  return useQuery({
    queryKey: linkKeys.list(filters || {}),
    queryFn: async (): Promise<LinksResponse> => {
      const params = new URLSearchParams()

      if (filters?.search) params.append('search', filters.search)
      if (filters?.tags && filters.tags.length > 0) params.append('tags', filters.tags.join(','))
      if (filters?.dateRange && filters.dateRange !== 'all') params.append('dateRange', filters.dateRange)
      if (filters?.sort && filters.sort !== 'newest') params.append('sort', filters.sort)

      if (
        filters?.search ||
        (filters?.tags && filters.tags.length > 0) ||
        (filters?.dateRange && filters.dateRange !== 'all') ||
        (filters?.sort && filters.sort !== 'newest')
      ) {
        const response = await fetch(`/api/links/filtered?${params}`)
        if (!response.ok) throw new Error('Error fetching filtered links')

        const data = await response.json()
        return { links: data.links, total: data.links.length, hasMore: false }
      } else {
        // Si no hay búsqueda, usar getUserLinks
        const result = await getUserLinks({})

        if (!result.success) {
          throw new Error(result.error || 'Error fetching links')
        }

        return { links: result.links ?? [], total: result.links?.length ?? 0, hasMore: false }
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutos para links
  })
}

// Hook para obtener un link específico
export function useLink(id: string) {
  return useQuery({
    queryKey: linkKeys.detail(id),
    queryFn: async (): Promise<Link> => {
      const result = await getLinkById(id)

      if (!result.success || !result.link) {
        throw new Error(result.error || 'Error fetching link')
      }

      return result.link
    },
    enabled: !!id,
  })
}

// Hook para paginación infinita
export function useInfiniteLinks(filters?: { tag?: string; search?: string; dateRange?: string; sort?: string }) {
  return useInfiniteQuery({
    queryKey: linkKeys.list(filters || {}),
    queryFn: async ({ pageParam }: { pageParam: number | undefined }): Promise<LinksResponse> => {
      const params = new URLSearchParams()

      if (filters?.tag) params.append('tags', filters.tag)
      if (filters?.search) params.append('search', filters.search)
      if (filters?.dateRange) params.append('dateRange', filters.dateRange)
      if (filters?.sort) params.append('sort', filters.sort)

      const limit = 20
      const offset = pageParam || 0
      params.append('limit', limit.toString())
      params.append('offset', offset.toString())

      const response = await fetch(`/api/links/filtered?${params}`)
      if (!response.ok) throw new Error('Error fetching links')

      const data = await response.json()
      const hasMore = data.links.length === limit

      return {
        links: data.links,
        nextCursor: hasMore ? (offset + limit).toString() : undefined,
        hasMore,
        total: data.links.length,
      }
    },
    initialPageParam: 0,
    getNextPageParam: lastPage => (lastPage.nextCursor ? parseInt(lastPage.nextCursor) : undefined),
  })
}

// Función de prefetch para links
export function prefetchLinks(filters?: { tag?: string; search?: string }) {
  return queryClient.prefetchQuery({
    queryKey: linkKeys.list(filters || {}),
    queryFn: async (): Promise<LinksResponse> => {
      if (filters?.search) {
        const params = new URLSearchParams()
        params.append('search', filters.search)
        if (filters.tag) params.append('tags', filters.tag)

        const response = await fetch(`/api/links/filtered?${params}`)
        if (!response.ok) throw new Error('Error fetching filtered links')

        const links = await response.json()
        return { links, total: links.length, hasMore: false }
      } else {
        const result = await getUserLinks({ tag: filters?.tag })

        if (!result.success) {
          throw new Error(result.error || 'Error fetching links')
        }

        return { links: result.links ?? [], total: result.links?.length ?? 0, hasMore: false }
      }
    },
    staleTime: 1000 * 60 * 5,
  })
}
