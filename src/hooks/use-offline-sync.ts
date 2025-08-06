import { useState, useCallback, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { db, type SyncQueueItem } from '@/lib/db'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

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
  const queryClient = useQueryClient()
  const isOnline = useOnlineStatus() // ✅ Usar hook centralizado
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: false, // Se actualizará automáticamente
    isSyncing: false,
    pendingItems: 0,
    errors: [],
  })
  const { user } = useUser()

  // ✅ Sincronizar el estado interno con useOnlineStatus
  useEffect(() => {
    setSyncStatus(prev => ({ ...prev, isOnline }))
  }, [isOnline])

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

            // ✅ Asegurar formato correcto para la API
            const requestBody = { name: tagData.name }

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
              console.log('✅ Tag already exists on server, deleted local copy')
              return true
            }

            // Si no existe, crear en servidor
            const response = await fetch('/api/tags', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(requestBody), // ✅ Enviar solo { name }
            })

            if (!response.ok) {
              const errorText = await response.text()
              console.error('❌ API Error:', response.status, errorText)
              throw new Error(`HTTP error! status: ${response.status}`)
            }

            const result = await response.json()
            console.log('✅ API Response:', result)

            if (result.success) {
              // ✅ Eliminar tag local, el servidor ya lo tiene
              await db.tags.delete(item.entityId)
              console.log('✅ Tag created on server, deleted local copy')
              return true
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
    if (!isOnline) {
      console.log('❌ Not online, skipping sync')
      return
    }

    if (syncStatus.isSyncing) {
      console.log('⚠️ Already syncing, skipping duplicate request')
      return
    }

    setSyncStatus(prev => ({ ...prev, isSyncing: true, errors: [] }))

    try {
      const pendingItems = await db.getPendingSyncItems()

      if (pendingItems.length === 0) {
        setSyncStatus(prev => ({ ...prev, isSyncing: false }))
        return
      }

      let successCount = 0
      let errorCount = 0
      const errors: string[] = []

      for (const item of pendingItems) {
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

      if (successCount > 0) {
        // ✅ Invalidar queries en paralelo para mejor performance
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ['tags'],
            exact: false, // Invalida todas las variantes de queries de tags
          }),
          queryClient.invalidateQueries({
            queryKey: ['links'],
            exact: false,
          }),
        ])
      }

      // Limpiar items que han fallado demasiadas veces
      await db.cleanupFailedSyncItems()

      // ✅ Obtener count real actualizado después de limpiar
      const remainingCount = await getPendingItemsCount()

      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSync: new Date(),
        pendingItems: remainingCount, // ✅ Usar count real, no calculado
        errors,
      }))

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
  }, [isOnline, syncStatus.isSyncing, syncItem, queryClient, getPendingItemsCount])

  // ✅ Auto-sync cuando detecta reconexión
  useEffect(() => {
    if (!isOnline) return // No hacer nada si está offline

    // Ejecutar auto-sync cuando vuelve online
    const autoSync = async () => {
      if (user?.id) {
        try {
          const pendingItems = await db.getPendingSyncItems()

          if (pendingItems.length > 0) {
            await syncAll()
          }
        } catch (error) {
          console.error('Error in auto-sync:', error)
        }
      }
    }

    // Dar tiempo para que se estabilice la conexión
    const timer = setTimeout(autoSync, 1000)

    return () => clearTimeout(timer)
  }, [isOnline, user?.id, syncAll])

  // Forzar sincronización manual
  const forceSync = useCallback(async () => {
    if (!isOnline) {
      toast.warning('No hay conexión a internet')
      return
    }

    await syncAll()
  }, [isOnline, syncAll])

  // Limpiar cola de sincronización
  const clearSyncQueue = useCallback(async () => {
    try {
      await db.syncQueue.clear()
      await getPendingItemsCount()

      toast.success('Cola de sincronización limpiada')
    } catch (error) {
      console.error('Error clearing sync queue:', error)
      toast.error('Error al limpiar la cola de sincronización')
    }
  }, [getPendingItemsCount])

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

    const handleOnline = () => {
      setIsOnline(true)
    }
    const handleOffline = () => {
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

// Hook para detectar cambios de conectividad y mostrar notificaciones
export function useConnectivityNotifications() {
  const isOnline = useOnlineStatus()
  const [previousOnlineStatus, setPreviousOnlineStatus] = useState<boolean | null>(null)

  useEffect(() => {
    // En el primer render, establecer el estado inicial sin mostrar notificación
    if (previousOnlineStatus === null) {
      setPreviousOnlineStatus(isOnline)
      return
    }

    // Solo mostrar notificaciones cuando cambie el estado
    if (isOnline !== previousOnlineStatus) {
      if (isOnline) {
        toast.success('Conexión restaurada')
      } else {
        toast.warning('Sin conexión - trabajando offline')
      }
      setPreviousOnlineStatus(isOnline)
    }
  }, [isOnline, previousOnlineStatus])
}
