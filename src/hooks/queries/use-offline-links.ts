import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'

// Query keys para offline (similar al patrón existente)
export const offlineLinkKeys = {
  all: ['offline-links'] as const,
  lists: () => [...offlineLinkKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...offlineLinkKeys.lists(), { filters }] as const,
  details: () => [...offlineLinkKeys.all, 'detail'] as const,
  detail: (id: string) => [...offlineLinkKeys.details(), id] as const,
}

// Hook para obtener todos los links offline de un usuario
export function useOfflineLinks(userId: string, filters?: { search?: string; tagName?: string }) {
  return useLiveQuery(async () => {
    if (!userId) return []

    // Si hay filtros, aplicarlos
    if (filters?.search) {
      return await db.searchLinks(userId, filters.search)
    }

    if (filters?.tagName) {
      return await db.getLinksByTag(userId, filters.tagName)
    }

    // Sin filtros, obtener todos los links
    return await db.getLinksWithTags(userId)
  }, [userId, filters?.search, filters?.tagName])
}

// Hook para obtener un link específico offline
export function useOfflineLink(linkId?: string) {
  return useLiveQuery(async () => {
    if (!linkId) return undefined
    return await db.getLinkWithTags(linkId)
  }, [linkId])
}

// Hook para obtener links por tag específico
export function useOfflineLinksByTag(userId: string, tagName: string) {
  return useLiveQuery(async () => {
    if (!userId || !tagName) return []
    return await db.getLinksByTag(userId, tagName)
  }, [userId, tagName])
}

// Hook para buscar links offline
export function useOfflineSearchLinks(userId: string, query: string) {
  return useLiveQuery(async () => {
    if (!userId || !query.trim()) return []
    return await db.searchLinks(userId, query)
  }, [userId, query])
}

// Hook para obtener estadísticas de links offline
export function useOfflineLinksStats(userId: string) {
  return useLiveQuery(async () => {
    if (!userId) return { total: 0, synced: 0, pending: 0 }

    const links = await db.links.where('userId').equals(userId).toArray()
    const total = links.length
    const synced = links.filter(link => link.synced).length
    const pending = total - synced

    return { total, synced, pending }
  }, [userId])
}

// Hook para verificar si hay datos offline disponibles
export function useHasOfflineData(userId: string) {
  return useLiveQuery(async () => {
    if (!userId) return false

    const linkCount = await db.links.where('userId').equals(userId).count()
    const tagCount = await db.tags.where('userId').equals(userId).count()

    return linkCount > 0 || tagCount > 0
  }, [userId])
}
