import { useMutation, useQueryClient } from '@tanstack/react-query'
import { linkKeys } from '../queries/use-links'
import { tagKeys } from '../queries/use-tags'
import { createLink, updateLink, deleteLink, saveLink, type LinkFormData } from '@/actions/links'

interface UpdateLinkData extends Partial<LinkFormData> {
  id: string
}

// Hook para crear un nuevo link
export function useCreateLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: LinkFormData) => {
      const result = await createLink(data)

      if (!result.success) {
        throw new Error(result.error || 'Error creating link')
      }

      return result
    },
    onSuccess: () => {
      // Invalidar todas las queries de links y tags
      queryClient.invalidateQueries({ queryKey: linkKeys.all })
      queryClient.invalidateQueries({ queryKey: tagKeys.all })
    },
  })
}

// Hook para actualizar un link existente
export function useUpdateLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateLinkData) => {
      const { id, ...linkData } = data
      const result = await updateLink(id, linkData as LinkFormData)

      if (!result.success) {
        throw new Error(result.error || 'Error updating link')
      }

      return result
    },
    onSuccess: (_, variables) => {
      // Invalidar queries específicas
      queryClient.invalidateQueries({ queryKey: linkKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: linkKeys.lists() })
      queryClient.invalidateQueries({ queryKey: tagKeys.all })
    },
  })
}

// Hook para eliminar un link
export function useDeleteLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteLink(id)

      if (!result.success) {
        throw new Error(result.error || 'Error deleting link')
      }

      return result
    },
    onSuccess: data => {
      if (data && data.id) {
        queryClient.invalidateQueries({ queryKey: linkKeys.detail(data.id) })
      }
      queryClient.invalidateQueries({ queryKey: linkKeys.all })
      queryClient.invalidateQueries({ queryKey: tagKeys.all })
    },
  })
}

// Hook para guardar un link (crear o actualizar)
export function useSaveLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      data,
      isUpdate = false,
      linkId,
    }: {
      data: LinkFormData
      isUpdate?: boolean
      linkId?: string
    }) => {
      const result = await saveLink(data, isUpdate, linkId)

      if (!result.success) {
        throw new Error(result.error || 'Error saving link')
      }

      return result
    },
    onSuccess: (_, variables) => {
      // Invalidar queries apropiadas
      if (variables.isUpdate && variables.linkId) {
        queryClient.invalidateQueries({ queryKey: linkKeys.detail(variables.linkId) })
      }
      queryClient.invalidateQueries({ queryKey: linkKeys.lists() })
      queryClient.invalidateQueries({ queryKey: tagKeys.all })
    },
  })
}
