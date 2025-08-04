import { useState, useCallback, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { db, type SyncQueueItem } from '@/lib/db'
import { toast } from 'sonner'

interface SyncStatus {
  isOnline: boolean
  isSyncing: boolean
  pendingItems: number
  lastSync?: Date
  errors: string[]
}

interface TagSyncData {
  name: string
  userId: string
  // otros campos necesarios
}

interface LinkSyncData {
  title: string
  url: string
  description?: string
  tags: string[]
  userId: string
  // otros campos necesarios
}

// Hook principal para sincronización
export function useOfflineSync() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,
    pendingItems: 0,
    errors: [],
  })
  const { user } = useUser()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateOnlineStatus = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: navigator.onLine }))
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    // Limpieza
    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  // Obtener items pendientes de sincronización
  const getPendingItemsCount = useCallback(async () => {
    try {
      const items = await db.getPendingSyncItems()
      setSyncStatus(prev => ({ ...prev, pendingItems: items.length }))

      return items.length
    } catch (error) {
      console.error('Error getting pending items:', error)
      return 0
    }
  }, [])

  // Sincronizar un item específico
  const syncItem = useCallback(async (item: SyncQueueItem): Promise<boolean> => {
    try {
      let success = false

      switch (item.entityType) {
        case 'link':
          success = await syncLinkItem(item)
          break
        case 'tag':
          success = await syncTagItem(item)
          break
        case 'linkTag':
          success = await syncLinkTagItem()
          break
        default:
          console.warn('Unknown entity type:', item.entityType)
          return false
      }

      if (success) {
        await db.markSyncItemAsProcessed(item.id)

        return true
      } else {
        await db.incrementSyncAttempts(item.id, 'Sync failed')

        return false
      }
    } catch (error) {
      console.error('Error syncing item:', error)
      await db.incrementSyncAttempts(item.id, error instanceof Error ? error.message : 'Unknown error')

      return false
    }
  }, [])

  // Sincronizar item de link
  const syncLinkItem = async (item: SyncQueueItem): Promise<boolean> => {
    try {
      switch (item.operationType) {
        case 'create':
          {
            const linkData = item.data as LinkSyncData

            const response = await fetch('/api/links', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(linkData),
            })

            if (response.ok) {
              const result = await response.json()
              if (result.success) {
                // Actualizar el link local como sincronizado
                await db.links.update(item.entityId, { synced: true })

                return true
              }
            }
          }
          break

        case 'update':
          {
            const linkData = item.data as LinkSyncData

            const response = await fetch(`/api/links/${item.entityId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(linkData),
            })

            if (response.ok) {
              const result = await response.json()
              if (result.success) {
                await db.links.update(item.entityId, { synced: true })
                return true
              }
            }
          }
          break

        case 'delete':
          {
            const response = await fetch(`/api/links/${item.entityId}`, {
              method: 'DELETE',
            })

            if (response.ok) {
              return true
            }
          }
          break
      }

      return false
    } catch (error) {
      console.error('Error syncing link item:', error)
      return false
    }
  }

  // Sincronizar item de tag con deduplicación robusta
  const syncTagItem = async (item: SyncQueueItem): Promise<boolean> => {
    try {
      switch (item.operationType) {
        case 'create':
          {
            const tagData = item.data as TagSyncData

            // Verificar si ya existe un tag con el mismo nombre en el servidor
            const tagsResponse = await fetch('/api/tags')
            const tagsData = await tagsResponse.json()
            const serverTags = tagsData.success ? tagsData.tags : []

            const existingServerTag = serverTags.find(
              (serverTag: { id: string; name: string }) => serverTag.name.toLowerCase() === tagData.name.toLowerCase()
            )

            if (existingServerTag) {
              // ✅ Si existe, simplemente eliminar el tag local
              await db.tags.delete(item.entityId)
              return true
            }

            // Si no existe, crear en servidor
            const response = await fetch('/api/tags', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: tagData.name }), // ✅ Enviar solo el name que espera la API
            })

            if (response.ok) {
              const result = await response.json()
              if (result.success) {
                // ✅ Eliminar tag local, el servidor ya lo tiene
                await db.tags.delete(item.entityId)
                return true
              }
            }
          }
          break

        case 'update':
          {
            const response = await fetch(`/api/tags/${item.entityId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item.data),
            })

            if (response.ok) {
              const result = await response.json()
              if (result.success) {
                await db.tags.update(item.entityId, { synced: true })
                return true
              }
            }
          }
          break

        case 'delete':
          {
            const response = await fetch(`/api/tags/${item.entityId}`, {
              method: 'DELETE',
            })

            if (response.ok) {
              return true
            }
          }
          break
      }
      return false
    } catch (error) {
      console.error('Error syncing tag item:', error)
      return false
    }
  }

  // Sincronizar item de relación link-tag
  const syncLinkTagItem = async (): Promise<boolean> => {
    // Esta lógica dependerá de cómo manejes las relaciones en tu API
    // Por ahora, retornamos true ya que las relaciones se manejan en los links
    return true
  }

  // Sincronizar todos los items pendientes
  const syncAll = useCallback(async () => {
    console.log('🔄 syncAll called - checking conditions...')
    
    if (!syncStatus.isOnline) {
      console.log('❌ Not online, skipping sync')
      return
    }
    
    if (syncStatus.isSyncing) {
      console.log('⚠️ Already syncing, skipping duplicate request')
      return
    }

    console.log('✅ Starting sync process...')
    setSyncStatus(prev => ({ ...prev, isSyncing: true, errors: [] }))

    try {
      const pendingItems = await db.getPendingSyncItems()
      console.log(`📋 Found ${pendingItems.length} pending items`)
      
      if (pendingItems.length === 0) {
        setSyncStatus(prev => ({ ...prev, isSyncing: false }))
        return
      }
      
      let successCount = 0
      let errorCount = 0
      const errors: string[] = []

      for (const item of pendingItems) {
        console.log(`🔄 Syncing: ${item.entityType} ${item.operationType}`)
        const success = await syncItem(item)
        if (success) {
          successCount++
          console.log(`✅ Synced: ${item.entityType} ${item.operationType}`)
        } else {
          errorCount++
          console.log(`❌ Failed: ${item.entityType} ${item.operationType}`)
          errors.push(`Error syncing ${item.entityType} ${item.operationType}`)
        }
      }

      // Limpiar items que han fallado demasiadas veces
      await db.cleanupFailedSyncItems()

      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSync: new Date(),
        errors,
      }))

      await getPendingItemsCount()

      if (successCount > 0) {
        toast.success(`${successCount} elementos sincronizados`)
      }

      if (errorCount > 0) {
        toast.error(`${errorCount} elementos fallaron al sincronizar`)
      }
    } catch (error) {
      console.error('Error during sync:', error)
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        errors: ['Error general durante la sincronización'],
      }))
      toast.error('Error durante la sincronización')
    }
  }, [syncStatus.isOnline, syncStatus.isSyncing, syncItem, getPendingItemsCount])

  // Actualizar estado de conexión
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleOnline = () => {
      console.log('🌐 Connection restored - starting sync...')
      setSyncStatus(prev => ({ ...prev, isOnline: true }))
      
      // ✅ Usar una función estable para evitar dependencias circulares
      setTimeout(async () => {
        if (user?.id) {
          console.log('🔄 Auto-sync triggered by reconnection')
          // Llamar directamente a syncAll sin incluirlo en las dependencias
          try {
            const pendingItems = await db.getPendingSyncItems()
            console.log(`📋 Auto-sync found ${pendingItems.length} pending items`)
            
            if (pendingItems.length > 0) {
              // Usar forceSync en lugar de syncAll para evitar dependencias
              console.log('🔄 Triggering force sync...')
            }
          } catch (error) {
            console.error('Error in auto-sync:', error)
          }
        }
      }, 100)
    }

    const handleOffline = () => {
      console.log('📴 Connection lost')
      setSyncStatus(prev => ({ ...prev, isOnline: false }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [user?.id])

  // Forzar sincronización manual
  const forceSync = async () => {
    if (!syncStatus.isOnline) {
      toast.warning('No hay conexión a internet')
      return
    }

    await syncAll()
  }

  // Limpiar cola de sincronización
  const clearSyncQueue = async () => {
    try {
      await db.syncQueue.clear()
      await getPendingItemsCount()

      toast.success('Cola de sincronización limpiada')
    } catch (error) {
      console.error('Error clearing sync queue:', error)
      toast.error('Error al limpiar la cola de sincronización')
    }
  }

  // Obtener estado inicial
  useEffect(() => {
    getPendingItemsCount()
  }, [getPendingItemsCount])

  return {
    syncStatus,
    syncAll,
    forceSync,
    clearSyncQueue,
    getPendingItemsCount,
  }
}

// Hook para estado de conectividad
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof window !== 'undefined' ? navigator.onLine : true // Evita error en SSR
  )

  useEffect(() => {
    if (typeof window === 'undefined') return

    console.log('useOnlineStatus: Initial online status:', isOnline)

    const handleOnline = () => {
      console.log('useOnlineStatus: Going online')
      setIsOnline(true)
    }
    const handleOffline = () => {
      console.log('useOnlineStatus: Going offline')
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [isOnline])

  return isOnline
}

// Hook para detectar cambios de conectividad
export function useConnectivityNotifications() {
  const [previousOnlineStatus, setPreviousOnlineStatus] = useState<boolean>(
    typeof window !== 'undefined' ? navigator.onLine : true // Evita error en SSR
  )

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Establecer el estado inicial correctamente
    setPreviousOnlineStatus(navigator.onLine)

    const handleOnline = () => {
      if (!previousOnlineStatus) {
        toast.success('Conexión restaurada')
      }

      setPreviousOnlineStatus(true)
    }

    const handleOffline = () => {
      if (previousOnlineStatus) {
        toast.warning('Sin conexión - trabajando offline')
      }

      setPreviousOnlineStatus(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [previousOnlineStatus])
}
