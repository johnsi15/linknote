import { useUser } from '@clerk/nextjs'
import { useTags } from '@/hooks/queries/use-tags'
import { useOfflineTags } from '@/hooks/queries/use-offline-tags'
import { useOnlineStatus } from '@/hooks/use-offline-sync'

export function useHybridTags() {
  const isOnline = useOnlineStatus()
  const { user } = useUser()

  const onlineQuery = useTags()
  const offlineTags = useOfflineTags(user?.id || '')

  const tags = isOnline
    ? onlineQuery.data?.tags || []
    : (() => {
        const localTags = offlineTags || []
        const cachedServerTags = onlineQuery.data?.tags || []

        const localTagNames = new Set(localTags.map(tag => tag.name.toLowerCase()))
        const uniqueServerTags = cachedServerTags.filter(serverTag => !localTagNames.has(serverTag.name.toLowerCase()))

        return [...localTags, ...uniqueServerTags]
      })()

  const isLoading = isOnline ? onlineQuery.isLoading : false

  return {
    tags: tags,
    isLoading: isLoading,
    error: onlineQuery.error,
    isOnline,
    source: isOnline ? 'server' : 'local',
    count: tags?.length || 0,
  }
}
