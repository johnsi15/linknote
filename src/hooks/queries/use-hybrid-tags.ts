import { useTags } from '@/hooks/queries/use-tags'
import { useOfflineTags } from '@/hooks/queries/use-offline-tags'
import { useOnlineStatus } from '@/hooks/use-offline-sync'
import { useUser } from '@clerk/nextjs'
import { Tag } from '@/types/tag'

// Hook simplificado para tags híbridos con fuente única
export function useHybridTags() {
  const { user } = useUser()
  const isOnline = useOnlineStatus()
  
  // Queries separadas para online y offline
  const onlineQuery = useTags()
  const offlineQuery = useOfflineTags(user?.id || '')
  
  // Extraer tags según la fuente
  const serverTags = onlineQuery.data?.tags || []
  const localTags = offlineQuery || []
  
  // Fuente única según conectividad
  const sourceTags = isOnline ? serverTags : localTags
  
  // Filtrar tags válidos
  const tags = sourceTags.filter((tag: Tag) => tag.id && tag.name)
  
  return {
    tags,
    isLoading: isOnline ? onlineQuery.isLoading : false,
    error: onlineQuery.error,
    isOnline,
    // Información adicional
    source: isOnline ? 'server' : 'local',
    count: tags.length
  }
}