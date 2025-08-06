import { useInfiniteQuery } from '@tanstack/react-query'
import { useQueryState, parseAsInteger } from 'nuqs'
import { useOnlineStatus } from '@/hooks/use-offline-sync'
import { useOfflineTags } from '@/hooks/queries/use-offline-tags'
import { useUser } from '@clerk/nextjs'
import { tagKeys } from './use-tags'
import { Tag } from '@/types/tag'

interface InfiniteTagsResponse {
  tags: Tag[]
  nextCursor?: number
  hasMore: boolean
  total: number
}
export function useHybridInfiniteTags(defaultLimit = 20) {
  const isOnline = useOnlineStatus()
  const [search] = useQueryState('search', { defaultValue: '' })
  const [limit] = useQueryState('limit', parseAsInteger.withDefault(defaultLimit))
  const { user } = useUser()
  const offlineTags = useOfflineTags(user?.id || '') // Pasa el userId requerido

  // Online: usa paginación infinita normal
  const onlineQuery = useInfiniteQuery<InfiniteTagsResponse, Error>({
    queryKey: tagKeys.list({ search, limit }),
    queryFn: async ({ pageParam = 0 }) => {
      const currentPage = typeof pageParam === 'number' ? pageParam : Number(pageParam) || 0
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      params.append('limit', String(limit))
      params.append('offset', String(currentPage * limit))
      const response = await fetch(`/api/tags?${params}`)
      if (!response.ok) throw new Error('Error fetching tags')
      const data = await response.json()
      const hasMore = data.tags.length === Number(limit)
      return {
        tags: data.tags,
        nextCursor: hasMore ? currentPage + 1 : undefined,
        hasMore,
        total: data.total,
      }
    },
    enabled: isOnline,
    initialPageParam: 0,
    getNextPageParam: lastPage => lastPage.nextCursor,
    staleTime: 1000 * 60 * 10,
  })

  // Offline: paginación manual sobre el array local
  function getOfflinePages() {
    if (!offlineTags) return { tags: [], total: 0 }
    let filtered = offlineTags
    if (search) filtered = filtered.filter(tag => tag.name.toLowerCase().includes(search.toLowerCase()))
    return { tags: filtered, total: filtered.length }
  }

  if (!isOnline) {
    const { tags, total } = getOfflinePages()
    // Simula paginación infinita local
    return {
      data: {
        pages: Array.from({ length: Math.ceil(tags.length / limit) }, (_, i) => ({
          tags: tags.slice(i * limit, (i + 1) * limit),
          nextCursor: i * limit + limit < tags.length ? i + 1 : undefined,
          hasMore: i * limit + limit < tags.length,
          total,
        })),
      },
      isLoading: false,
      isFetchingNextPage: false,
      fetchNextPage: () => {},
      hasNextPage: false,
    }
  }

  // Online: retorna el query de TanStack Query
  return onlineQuery
}
