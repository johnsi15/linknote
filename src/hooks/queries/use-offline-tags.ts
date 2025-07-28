import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'

// Query keys para tags offline
export const offlineTagKeys = {
  all: ['offline-tags'] as const,
  lists: () => [...offlineTagKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...offlineTagKeys.lists(), { filters }] as const,
  details: () => [...offlineTagKeys.all, 'detail'] as const,
  detail: (id: string) => [...offlineTagKeys.details(), id] as const,
}

// Hook para obtener todos los tags offline con conteo
export function useOfflineTags(userId: string) {
  return useLiveQuery(async () => {
    if (!userId) return []

    return await db.getTagsWithCount(userId)
  }, [userId])
}

// Hook para obtener un tag específico offline
export function useOfflineTag(tagId?: string) {
  return useLiveQuery(async () => {
    if (!tagId) return undefined

    return await db.tags.get(tagId)
  }, [tagId])
}

// Hook para obtener tags más usados
export function useOfflinePopularTags(userId: string, limit: number = 10) {
  return useLiveQuery(async () => {
    if (!userId) return []

    const tagsWithCount = await db.getTagsWithCount(userId)
    return tagsWithCount.sort((a, b) => b.count - a.count).slice(0, limit)
  }, [userId, limit])
}

// Hook para buscar tags por nombre
export function useOfflineSearchTags(userId: string, query: string) {
  return useLiveQuery(async () => {
    if (!userId || !query.trim()) return []

    const searchTerm = query.toLowerCase()
    return await db.tags
      .where('userId')
      .equals(userId)
      .filter(tag => tag.name.toLowerCase().includes(searchTerm))
      .toArray()
  }, [userId, query])
}

// Hook para obtener estadísticas de tags offline
export function useOfflineTagsStats(userId: string) {
  return useLiveQuery(async () => {
    if (!userId) return { total: 0, synced: 0, pending: 0, mostUsed: null }

    const tags = await db.tags.where('userId').equals(userId).toArray()
    const tagsWithCount = await db.getTagsWithCount(userId)

    const total = tags.length
    const synced = tags.filter(tag => tag.synced).length
    const pending = total - synced
    const mostUsed = tagsWithCount.reduce(
      (prev, current) => (prev.count > current.count ? prev : current),
      tagsWithCount[0] || null
    )

    return { total, synced, pending, mostUsed }
  }, [userId])
}

// Hook para verificar si un tag existe offline
export function useOfflineTagExists(userId: string, tagName: string) {
  return useLiveQuery(async () => {
    if (!userId || !tagName) return false

    const tag = await db.tags
      .where('userId')
      .equals(userId)
      .filter(tag => tag.name.toLowerCase() === tagName.toLowerCase())
      .first()

    return !!tag
  }, [userId, tagName])
}
