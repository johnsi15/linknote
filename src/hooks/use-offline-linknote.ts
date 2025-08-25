import { useUser } from '@clerk/nextjs'
import { useOfflineLinks, useOfflineLink } from './queries/use-offline-links'
import { useOfflineTags } from './queries/use-offline-tags'
import {
  useCreateOfflineLink,
  useUpdateOfflineLink,
  useDeleteOfflineLink,
  useUpdateOfflineLinkTags,
  useBulkOfflineLinkOperations,
} from './mutations/use-offline-link-mutations'
import {
  useCreateOfflineTag,
  useUpdateOfflineTag,
  useDeleteOfflineTag,
  useMergeOfflineTags,
  useCleanupOfflineUnusedTags,
} from './mutations/use-offline-tag-mutations'
import { useOfflineSync, useOnlineStatus, useConnectivityNotifications } from './use-offline-sync'

// Hook principal que combina toda la funcionalidad offline
export function useOfflineLinknote() {
  const { user } = useUser()
  const userId = user?.id || ''

  // Queries
  const linksQuery = useOfflineLinks(userId)
  const tagsQuery = useOfflineTags(userId)

  // Mutations para links
  const createLink = useCreateOfflineLink()
  const updateLink = useUpdateOfflineLink()
  const deleteLink = useDeleteOfflineLink()
  const updateLinkTags = useUpdateOfflineLinkTags()
  const bulkOperations = useBulkOfflineLinkOperations()

  // Mutations para tags
  const createTag = useCreateOfflineTag()
  const updateTag = useUpdateOfflineTag()
  const deleteTag = useDeleteOfflineTag()
  const mergeTags = useMergeOfflineTags()
  const cleanupTags = useCleanupOfflineUnusedTags()

  // Sincronización
  const sync = useOfflineSync()
  const isOnline = useOnlineStatus()

  // Estado de carga general
  const isLoading =
    createLink.isLoading ||
    updateLink.isLoading ||
    deleteLink.isLoading ||
    updateLinkTags.isLoading ||
    bulkOperations.isLoading ||
    createTag.isLoading ||
    updateTag.isLoading ||
    deleteTag.isLoading ||
    mergeTags.isLoading ||
    cleanupTags.isLoading ||
    sync.syncStatus.isSyncing

  return {
    // Datos
    links: linksQuery || [],
    tags: tagsQuery || [],

    // Estados
    isLoading,
    isOnline,
    syncStatus: sync.syncStatus,

    // Operaciones de links
    link: {
      create: createLink.createLink,
      update: updateLink.updateLink,
      delete: deleteLink.deleteLink,
      updateTags: updateLinkTags.updateTags,
      bulkDelete: bulkOperations.bulkDelete,
      bulkUpdateTags: bulkOperations.bulkUpdateTags,
    },

    // Operaciones de tags
    tag: {
      create: createTag.createTag,
      update: updateTag.updateTag,
      delete: deleteTag.deleteTag,
      merge: mergeTags.mergeTags,
      cleanup: cleanupTags.cleanupUnusedTags,
    },

    // Sincronización
    sync: {
      syncAll: sync.syncAll,
      forceSync: sync.forceSync,
      clearQueue: sync.clearSyncQueue,
      getPendingCount: sync.getPendingItemsCount,
    },
  }
}

// Hook para obtener un link específico offline
export function useOfflineLinkDetail(linkId?: string) {
  const linkQuery = useOfflineLink(linkId)
  const updateLink = useUpdateOfflineLink()
  const deleteLink = useDeleteOfflineLink()
  const updateTags = useUpdateOfflineLinkTags()

  return {
    link: linkQuery,
    isLoading: updateLink.isLoading || deleteLink.isLoading || updateTags.isLoading,
    update: updateLink.updateLink,
    delete: deleteLink.deleteLink,
    updateTags: updateTags.updateTags,
  }
}

// Hook para búsquedas offline
export function useOfflineSearchLinks(query?: string) {
  const { user } = useUser()
  const userId = user?.id || ''

  return useOfflineLinks(userId, query ? { search: query } : undefined)
}

export function useOfflineLinksByTag(tagName?: string) {
  const { user } = useUser()
  const userId = user?.id || ''

  return useOfflineLinks(userId, tagName ? { tagName } : undefined)
}

// Configurar notificaciones de conectividad al usar cualquier hook offline
export function useOfflineNotifications() {
  useConnectivityNotifications()
}
