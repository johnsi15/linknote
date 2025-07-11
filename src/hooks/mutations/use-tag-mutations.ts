import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tagKeys } from '../queries/use-tags'
import { linkKeys } from '../queries/use-links'
import { addTag, updateTag, deleteTag } from '@/actions/tags'

// Hook para crear un nuevo tag
export function useCreateTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (name: string) => {
      const result = await addTag(name)

      if (!result.success) {
        throw new Error(result.error || 'Error creating tag')
      }

      return result.tag
    },
    onSuccess: () => {
      // Invalidar todas las queries de tags
      queryClient.invalidateQueries({ queryKey: tagKeys.all })
    },
  })
}

// Hook para actualizar un tag existente
export function useUpdateTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const result = await updateTag(id, name)

      if (!result.success) {
        throw new Error(result.error || 'Error updating tag')
      }

      return result.tag
    },
    onSuccess: () => {
      // Invalidar queries de tags y links (por si cambió el nombre del tag)
      queryClient.invalidateQueries({ queryKey: tagKeys.all })
      queryClient.invalidateQueries({ queryKey: linkKeys.all })
    },
  })
}

// Hook para eliminar un tag
export function useDeleteTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteTag(id)

      if (!result.success) {
        throw new Error(result.error || 'Error deleting tag')
      }

      return result
    },
    onSuccess: () => {
      // Invalidar queries de tags y links
      queryClient.invalidateQueries({ queryKey: tagKeys.all })
      queryClient.invalidateQueries({ queryKey: linkKeys.all })
    },
  })
}
