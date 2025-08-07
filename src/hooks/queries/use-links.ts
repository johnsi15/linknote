import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { Link } from '@/types/link'
import { useQueryState, parseAsString, parseAsInteger } from 'nuqs'

interface LinksResponse {
  links: Link[]
  nextCursor?: number
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
        const response = await fetch('/api/links')
        if (!response.ok) throw new Error('Error fetching links')

        const data = await response.json()
        return { links: data.links, total: data.total, hasMore: data.hasMore }
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
      const response = await fetch(`/api/links/${id}`)
      if (!response.ok) throw new Error('Error fetching link')

      const data = await response.json()
      return data.link
    },
    enabled: !!id && id !== 'new',
  })
}

// Hook para paginación infinita
export function useInfiniteLinks(defaultLimit = 10) {
  const [search] = useQueryState('search', { defaultValue: '' })
  const [tags] = useQueryState('tags', { defaultValue: '' })
  const [dateRange] = useQueryState('dateRange', parseAsString.withDefault('all'))
  const [sort] = useQueryState('sort', parseAsString.withDefault('newest'))
  const [limit] = useQueryState('limit', parseAsInteger.withDefault(defaultLimit))

  return useInfiniteQuery<LinksResponse, Error>({
    queryKey: linkKeys.list({ search, tags, dateRange, sort, limit }),
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams()

      if (search) params.append('search', search)
      if (tags) params.append('tags', tags)
      if (dateRange && dateRange !== 'all') params.append('dateRange', dateRange)
      if (sort && sort !== 'newest') params.append('sort', sort)

      params.append('limit', String(limit))
      params.append('offset', String(pageParam))

      const response = await fetch(`/api/links/filtered?${params}`)

      if (!response.ok) throw new Error('Error fetching links')

      const data = await response.json()

      const hasMore = data.links.length === limit

      const currentPage = Number(pageParam) || 0

      return {
        links: data.links,
        nextCursor: hasMore ? currentPage + Number(limit) : undefined,
        hasMore,
        total: data.total,
      }
    },
    initialPageParam: 0,
    getNextPageParam: lastPage => lastPage.nextCursor,
  })
}

// Función de prefetch para links
export function prefetchLinks(filters?: { tags?: string[]; search?: string; dateRange?: string; sort?: string }) {
  return queryClient.prefetchQuery({
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
        const response = await fetch('/api/links')
        if (!response.ok) throw new Error('Error fetching links')

        const data = await response.json()
        return { links: data.links, total: data.total, hasMore: data.hasMore }
      }
    },
    staleTime: 1000 * 60 * 5,
  })
}
