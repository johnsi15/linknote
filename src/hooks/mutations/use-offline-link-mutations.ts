import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { nanoid } from 'nanoid'
import { db, type OfflineLink } from '@/lib/db'
import { toast } from 'sonner'

interface CreateOfflineLinkData {
  title: string
  url: string
  description?: string | null
  tags?: string[]
}

interface UpdateOfflineLinkData extends Partial<CreateOfflineLinkData> {
  id: string
}

// Hook para crear un link offline
export function useCreateOfflineLink() {
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useUser()

  const createLink = async (data: CreateOfflineLinkData) => {
    if (!user?.id) {
      toast.error('Usuario no autenticado')
      return null
    }

    setIsLoading(true)
    try {
      const linkId = nanoid()
      const now = new Date()

      const offlineLink: OfflineLink = {
        id: linkId,
        userId: user.id,
        title: data.title,
        url: data.url,
        description: data.description || null,
        tags: data.tags || [],
        createdAt: now,
        updatedAt: now,
        synced: false,
        lastModified: now,
      }

      await db.links.add(offlineLink)

      // Agregar a la cola de sincronización
      await db.addToSyncQueue('link', 'create', linkId, data)

      toast.success('Link guardado offline')
      return linkId
    } catch (error) {
      console.error('Error creating offline link:', error)
      toast.error('Error al guardar el link offline')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return {
    createLink,
    isLoading,
  }
}

// Hook para actualizar un link offline
export function useUpdateOfflineLink() {
  const [isLoading, setIsLoading] = useState(false)

  const updateLink = async (data: UpdateOfflineLinkData) => {
    setIsLoading(true)
    try {
      const { id, ...updateData } = data

      await db.links.update(id, {
        ...updateData,
        updatedAt: new Date(),
        lastModified: new Date(),
        synced: false,
      })

      // Agregar a la cola de sincronización
      await db.addToSyncQueue('link', 'update', id, updateData)

      toast.success('Link actualizado offline')
      return true
    } catch (error) {
      console.error('Error updating offline link:', error)
      toast.error('Error al actualizar el link offline')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return {
    updateLink,
    isLoading,
  }
}

// Hook para eliminar un link offline
export function useDeleteOfflineLink() {
  const [isLoading, setIsLoading] = useState(false)

  const deleteLink = async (linkId: string) => {
    setIsLoading(true)
    try {
      // Obtener el link antes de eliminarlo para la cola de sync
      const link = await db.links.get(linkId)

      await db.links.delete(linkId)

      // Si el link existía y estaba sincronizado, agregar delete a la cola
      if (link && link.synced) {
        await db.addToSyncQueue('link', 'delete', linkId)
      }

      toast.success('Link eliminado')
      return true
    } catch (error) {
      console.error('Error deleting offline link:', error)
      toast.error('Error al eliminar el link')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return {
    deleteLink,
    isLoading,
  }
}

// Hook para agregar/quitar tags de un link offline
export function useUpdateOfflineLinkTags() {
  const [isLoading, setIsLoading] = useState(false)

  const updateTags = async (linkId: string, tags: string[]) => {
    setIsLoading(true)
    try {
      await db.links.update(linkId, {
        tags,
        updatedAt: new Date(),
        lastModified: new Date(),
        synced: false,
      })

      // Agregar a la cola de sincronización
      await db.addToSyncQueue('link', 'update', linkId, { tags })

      toast.success('Tags actualizados offline')
      return true
    } catch (error) {
      console.error('Error updating offline link tags:', error)
      toast.error('Error al actualizar los tags')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return {
    updateTags,
    isLoading,
  }
}

// Hook para operaciones por lotes offline
export function useBulkOfflineLinkOperations() {
  const [isLoading, setIsLoading] = useState(false)

  const bulkDelete = async (linkIds: string[]) => {
    setIsLoading(true)
    try {
      const deletePromises = linkIds.map(async linkId => {
        const link = await db.links.get(linkId)
        await db.links.delete(linkId)

        if (link && link.synced) {
          await db.addToSyncQueue('link', 'delete', linkId)
        }
      })

      await Promise.all(deletePromises)
      toast.success(`${linkIds.length} links eliminados`)
      return true
    } catch (error) {
      console.error('Error in bulk delete:', error)
      toast.error('Error en eliminación masiva')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const bulkUpdateTags = async (linkIds: string[], tags: string[]) => {
    setIsLoading(true)
    try {
      const updatePromises = linkIds.map(async linkId => {
        await db.links.update(linkId, {
          tags,
          updatedAt: new Date(),
          lastModified: new Date(),
          synced: false,
        })
        await db.addToSyncQueue('link', 'update', linkId, { tags })
      })

      await Promise.all(updatePromises)
      toast.success(`Tags actualizados en ${linkIds.length} links`)
      return true
    } catch (error) {
      console.error('Error in bulk tag update:', error)
      toast.error('Error en actualización masiva de tags')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return {
    bulkDelete,
    bulkUpdateTags,
    isLoading,
  }
}
