import { useUser } from '@clerk/nextjs'
import { useTags } from '@/hooks/queries/use-tags'
import { useOfflineTags } from '@/hooks/queries/use-offline-tags'
import { useOnlineStatus } from '@/hooks/use-offline-sync'

export function useHybridTags() {
  const isOnline = useOnlineStatus()
  const { user } = useUser()

  const onlineQuery = useTags()
  const offlineTags = useOfflineTags(user?.id || '')

  // Determinar qué datos usar según el estado de conexión
  const tags = isOnline ? onlineQuery.data?.tags || [] : offlineTags || []
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
