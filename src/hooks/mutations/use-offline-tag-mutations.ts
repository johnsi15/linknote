import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { nanoid } from 'nanoid'
import { db, type OfflineTag } from '@/lib/db'
import { toast } from 'sonner'

interface CreateOfflineTagData {
  name: string
}

interface UpdateOfflineTagData {
  id: string
  name: string
}

// Hook para crear un tag offline
export function useCreateOfflineTag() {
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useUser()

  const createTag = async (data: CreateOfflineTagData) => {
    if (!user?.id) {
      toast.error('Usuario no autenticado')
      return null
    }

    setIsLoading(true)
    try {
      // Verificar si el tag ya existe
      const existingTag = await db.tags
        .where('userId')
        .equals(user.id)
        .filter(tag => tag.name.toLowerCase() === data.name.toLowerCase())
        .first()

      if (existingTag) {
        toast.error('El tag ya existe')
        return existingTag.id
      }

      const tagId = nanoid()
      const now = new Date()

      const offlineTag: OfflineTag = {
        id: tagId,
        name: data.name,
        userId: user.id,
        createdAt: now,
        synced: false,
        lastModified: now,
      }

      await db.tags.add(offlineTag)

      // Agregar a la cola de sincronización
      await db.addToSyncQueue('tag', 'create', tagId, data)

      toast.success('Tag creado offline')
      return tagId
    } catch (error) {
      console.error('Error creating offline tag:', error)
      toast.error('Error al crear el tag offline')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return {
    createTag,
    isLoading,
  }
}

// Hook para actualizar un tag offline
export function useUpdateOfflineTag() {
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useUser()

  const updateTag = async (data: UpdateOfflineTagData) => {
    if (!user?.id) {
      toast.error('Usuario no autenticado')
      return false
    }

    setIsLoading(true)
    try {
      // Verificar si ya existe otro tag con el mismo nombre
      const existingTag = await db.tags
        .where('userId')
        .equals(user.id)
        .filter(tag => tag.name.toLowerCase() === data.name.toLowerCase() && tag.id !== data.id)
        .first()

      if (existingTag) {
        toast.error('Ya existe un tag con ese nombre')
        return false
      }

      const oldTag = await db.tags.get(data.id)
      if (!oldTag) {
        toast.error('Tag no encontrado')
        return false
      }

      await db.tags.update(data.id, {
        name: data.name,
        lastModified: new Date(),
        synced: false,
      })

      // También actualizar el nombre en todos los links que usen este tag
      const linksWithTag = await db.links
        .where('userId')
        .equals(user.id)
        .filter(link => link.tags.includes(oldTag.name))
        .toArray()

      for (const link of linksWithTag) {
        const updatedTags = link.tags.map(tag => (tag === oldTag.name ? data.name : tag))

        await db.links.update(link.id, {
          tags: updatedTags,
          lastModified: new Date(),
          synced: false,
        })

        // Agregar actualización de link a la cola
        await db.addToSyncQueue('link', 'update', link.id, { tags: updatedTags })
      }

      // Agregar actualización de tag a la cola
      await db.addToSyncQueue('tag', 'update', data.id, { name: data.name })

      toast.success('Tag actualizado offline')
      return true
    } catch (error) {
      console.error('Error updating offline tag:', error)
      toast.error('Error al actualizar el tag offline')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return {
    updateTag,
    isLoading,
  }
}

// Hook para eliminar un tag offline
export function useDeleteOfflineTag() {
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useUser()

  const deleteTag = async (tagId: string) => {
    if (!user?.id) {
      toast.error('Usuario no autenticado')
      return false
    }

    setIsLoading(true)
    try {
      const tag = await db.tags.get(tagId)
      if (!tag) {
        toast.error('Tag no encontrado')
        return false
      }

      // Eliminar el tag de todos los links que lo usen
      const linksWithTag = await db.links
        .where('userId')
        .equals(user.id)
        .filter(link => link.tags.includes(tag.name))
        .toArray()

      for (const link of linksWithTag) {
        const updatedTags = link.tags.filter(t => t !== tag.name)

        await db.links.update(link.id, {
          tags: updatedTags,
          lastModified: new Date(),
          synced: false,
        })

        // Agregar actualización de link a la cola
        await db.addToSyncQueue('link', 'update', link.id, { tags: updatedTags })
      }

      await db.tags.delete(tagId)

      // Si el tag estaba sincronizado, agregar delete a la cola
      if (tag.synced) {
        await db.addToSyncQueue('tag', 'delete', tagId)
      }

      toast.success('Tag eliminado')
      return true
    } catch (error) {
      console.error('Error deleting offline tag:', error)
      toast.error('Error al eliminar el tag')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return {
    deleteTag,
    isLoading,
  }
}

// Hook para fusionar tags offline
export function useMergeOfflineTags() {
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useUser()

  const mergeTags = async (sourceTagId: string, targetTagId: string) => {
    if (!user?.id) {
      toast.error('Usuario no autenticado')
      return false
    }

    setIsLoading(true)
    try {
      const sourceTag = await db.tags.get(sourceTagId)
      const targetTag = await db.tags.get(targetTagId)

      if (!sourceTag || !targetTag) {
        toast.error('Tags no encontrados')
        return false
      }

      // Actualizar todos los links que usen el tag origen para usar el tag destino
      const linksWithSourceTag = await db.links
        .where('userId')
        .equals(user.id)
        .filter(link => link.tags.includes(sourceTag.name))
        .toArray()

      for (const link of linksWithSourceTag) {
        const updatedTags = link.tags.map(tag => (tag === sourceTag.name ? targetTag.name : tag))

        // Eliminar duplicados si ya tenía el tag destino
        const uniqueTags = [...new Set(updatedTags)]

        await db.links.update(link.id, {
          tags: uniqueTags,
          lastModified: new Date(),
          synced: false,
        })

        await db.addToSyncQueue('link', 'update', link.id, { tags: uniqueTags })
      }

      // Eliminar el tag origen
      await db.tags.delete(sourceTagId)

      if (sourceTag.synced) {
        await db.addToSyncQueue('tag', 'delete', sourceTagId)
      }

      toast.success(`Tag "${sourceTag.name}" fusionado con "${targetTag.name}"`)
      return true
    } catch (error) {
      console.error('Error merging offline tags:', error)
      toast.error('Error al fusionar los tags')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return {
    mergeTags,
    isLoading,
  }
}

// Hook para limpiar tags no usados
export function useCleanupOfflineUnusedTags() {
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useUser()

  const cleanupUnusedTags = async () => {
    if (!user?.id) {
      toast.error('Usuario no autenticado')
      return 0
    }

    setIsLoading(true)
    try {
      const tagsWithCount = await db.getTagsWithCount(user.id)
      const unusedTags = tagsWithCount.filter(tag => tag.count === 0)

      let deletedCount = 0
      for (const tag of unusedTags) {
        await db.tags.delete(tag.id)

        if (tag.synced) {
          await db.addToSyncQueue('tag', 'delete', tag.id)
        }
        deletedCount++
      }

      if (deletedCount > 0) {
        toast.success(`${deletedCount} tags no usados eliminados`)
      } else {
        toast.info('No hay tags no usados para eliminar')
      }

      return deletedCount
    } catch (error) {
      console.error('Error cleaning up unused tags:', error)
      toast.error('Error al limpiar tags no usados')
      return 0
    } finally {
      setIsLoading(false)
    }
  }

  return {
    cleanupUnusedTags,
    isLoading,
  }
}
