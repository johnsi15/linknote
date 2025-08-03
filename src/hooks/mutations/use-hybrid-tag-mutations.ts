import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useOnlineStatus } from '@/hooks/use-offline-sync'
import { useCreateOfflineTag, useUpdateOfflineTag, useDeleteOfflineTag } from '@/hooks/mutations/use-offline-tag-mutations'
import { useCreateTag, useUpdateTag, useDeleteTag } from '@/hooks/mutations/use-tag-mutations'
import { toast } from 'sonner'
import { Tag } from '@/types/tag'

// Tipo para la respuesta de tags
interface TagsResponse {
  success: boolean
  tags: Tag[]
}

// Hook híbrido para crear tags con optimistic updates
export function useHybridCreateTag() {
  const queryClient = useQueryClient()
  const isOnline = useOnlineStatus()
  
  // Hooks para ambos modos
  const onlineCreate = useCreateTag()
  const { createTag: offlineCreate } = useCreateOfflineTag()
  
  return useMutation({
    mutationFn: async (tagName: string) => {
      if (!isOnline) {
        // Modo offline
        const tagId = await offlineCreate({ name: tagName })
        if (!tagId) throw new Error('Failed to create tag offline')
        return { id: tagId, name: tagName }
      } else {
        // Modo online - usar TanStack Query normal
        return new Promise((resolve, reject) => {
          onlineCreate.mutate(tagName, {
            onSuccess: (data) => resolve(data),
            onError: (error) => reject(error)
          })
        })
      }
    },
    onMutate: async (tagName: string) => {
      // Optimistic update inmediato
      if (!isOnline) {
        // Para offline, invalidar queries locales
        queryClient.invalidateQueries({ queryKey: ['offline-tags'] })
      }
      
      // Cancelar queries en vuelo
      await queryClient.cancelQueries({ queryKey: ['tags'] })
      
      // Snapshot del estado anterior
      const previousTags = queryClient.getQueryData(['tags'])
      
      // Optimistic update
      queryClient.setQueryData(['tags'], (old: TagsResponse | undefined) => {
        if (!old?.tags) return old
        const newTag: Tag = {
          id: `temp-${Date.now()}`,
          name: tagName,
          count: 0,
          createdAt: new Date()
        }
        return {
          ...old,
          tags: [...old.tags, newTag]
        }
      })
      
      return { previousTags }
    },
    onSuccess: (data, tagName) => {
      // Invalidar queries para refrescar datos
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      if (!isOnline) {
        queryClient.invalidateQueries({ queryKey: ['offline-tags'] })
      }
      
      toast.success('Tag created', { 
        description: `The tag "${tagName}" has been created${!isOnline ? ' offline' : ''}.` 
      })
    },
    onError: (error, tagName, context) => {
      // Revertir optimistic update
      if (context?.previousTags) {
        queryClient.setQueryData(['tags'], context.previousTags)
      }
      
      toast.error('Error creating tag', {
        description: error instanceof Error ? error.message : 'An error occurred while creating the tag.'
      })
    }
  })
}

// Hook híbrido para actualizar tags
export function useHybridUpdateTag() {
  const queryClient = useQueryClient()
  const isOnline = useOnlineStatus()
  
  const onlineUpdate = useUpdateTag()
  const { updateTag: offlineUpdate } = useUpdateOfflineTag()
  
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      if (!isOnline) {
        const success = await offlineUpdate({ id, name })
        if (!success) throw new Error('Failed to update tag offline')
        return { id, name }
      } else {
        return new Promise((resolve, reject) => {
          onlineUpdate.mutate({ id, name }, {
            onSuccess: (data) => resolve(data),
            onError: (error) => reject(error)
          })
        })
      }
    },
    onSuccess: (data, { name }) => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      if (!isOnline) {
        queryClient.invalidateQueries({ queryKey: ['offline-tags'] })
      }
      
      toast.success('Tag updated', { 
        description: `The tag has been updated to "${name}"${!isOnline ? ' offline' : ''}.` 
      })
    },
    onError: (error) => {
      toast.error('Error updating tag', {
        description: error instanceof Error ? error.message : 'An error occurred while updating the tag.'
      })
    }
  })
}

// Hook híbrido para eliminar tags
export function useHybridDeleteTag() {
  const queryClient = useQueryClient()
  const isOnline = useOnlineStatus()
  
  const onlineDelete = useDeleteTag()
  const { deleteTag: offlineDelete } = useDeleteOfflineTag()
  
  return useMutation({
    mutationFn: async (tagId: string) => {
      if (!isOnline) {
        const success = await offlineDelete(tagId)
        if (!success) throw new Error('Failed to delete tag offline')
        return tagId
      } else {
        return new Promise((resolve, reject) => {
          onlineDelete.mutate(tagId, {
            onSuccess: () => resolve(tagId),
            onError: (error) => reject(error)
          })
        })
      }
    },
    onMutate: async (tagId: string) => {
      // Optimistic update - remover tag inmediatamente
      await queryClient.cancelQueries({ queryKey: ['tags'] })
      
      const previousTags = queryClient.getQueryData(['tags'])
      
      queryClient.setQueryData(['tags'], (old: TagsResponse | undefined) => {
        if (!old?.tags) return old
        return {
          ...old,
          tags: old.tags.filter((tag: Tag) => tag.id !== tagId)
        }
      })
      
      return { previousTags }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      if (!isOnline) {
        queryClient.invalidateQueries({ queryKey: ['offline-tags'] })
      }
      
      toast.success('Tag deleted', { 
        description: `The tag has been deleted${!isOnline ? ' offline' : ''}.` 
      })
    },
    onError: (error, tagId, context) => {
      // Revertir optimistic update
      if (context?.previousTags) {
        queryClient.setQueryData(['tags'], context.previousTags)
      }
      
      toast.error('Error deleting tag', {
        description: error instanceof Error ? error.message : 'An error occurred while deleting the tag.'
      })
    }
  })
}