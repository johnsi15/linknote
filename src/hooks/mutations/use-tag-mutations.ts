import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tagKeys } from '@/hooks/queries/use-tags'
import { linkKeys } from '@/hooks/queries/use-links'
import { tagClustersKeys } from '@/hooks/queries/use-tag-clusters'
import { similarTagsKeys } from '@/hooks/mutations/use-tag-embeddings'

interface Tag {
  id: string
  name: string
}

interface TagApiResponseSuccess {
  success: true
  tag: Tag
}

interface TagApiResponseError {
  success: false
  error: string
}

type TagApiResponse = TagApiResponseSuccess | TagApiResponseError

// Helpers para consumir la API route de tags
async function apiAddTag(name: string): Promise<TagApiResponse> {
  const res = await fetch('/api/tags', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })

  const result: TagApiResponse = await res.json()

  if (!res.ok || !result.success) {
    const errorMsg = 'error' in result ? result.error : 'Error creating tag'
    throw new Error(errorMsg)
  }

  return result
}

async function apiUpdateTag(id: string, name: string): Promise<TagApiResponse> {
  const res = await fetch(`/api/tags/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })

  const result: TagApiResponse = await res.json()

  if (!res.ok || !result.success) {
    const errorMsg = 'error' in result ? result.error : 'Error updating tag'
    throw new Error(errorMsg)
  }

  return result
}

async function apiDeleteTag(id: string): Promise<TagApiResponse> {
  const res = await fetch(`/api/tags/${id}`, {
    method: 'DELETE',
  })

  const result: TagApiResponse = await res.json()

  if (!res.ok || !result.success) {
    const errorMsg = 'error' in result ? result.error : 'Error deleting tag'
    throw new Error(errorMsg)
  }

  return result
}

// Hook para crear un nuevo tag
export function useCreateTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (name: string) => {
      const result = await apiAddTag(name)
      if (!result.success) {
        const errorMsg = 'error' in result ? result.error : 'Error creating tag'
        throw new Error(errorMsg)
      }

      return result.tag
    },
    onSuccess: () => {
      // Invalidar todas las queries de tags y clusters
      queryClient.invalidateQueries({ queryKey: tagKeys.all })
      queryClient.invalidateQueries({ queryKey: tagClustersKeys.all })
      queryClient.invalidateQueries({ queryKey: similarTagsKeys.all })
    },
  })
}

// Hook para actualizar un tag existente
export function useUpdateTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const result = await apiUpdateTag(id, name)
      if (!result.success) {
        const errorMsg = 'error' in result ? result.error : 'Error updating tag'
        throw new Error(errorMsg)
      }

      return result.tag
    },
    onSuccess: () => {
      // Invalidar queries de tags, links y clusters (por si cambió el nombre del tag)
      queryClient.invalidateQueries({ queryKey: tagKeys.all })
      queryClient.invalidateQueries({ queryKey: linkKeys.all })
      queryClient.invalidateQueries({ queryKey: tagClustersKeys.all })
      queryClient.invalidateQueries({ queryKey: similarTagsKeys.all })
    },
  })
}

// Hook para eliminar un tag
export function useDeleteTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await apiDeleteTag(id)

      return result
    },
    onSuccess: () => {
      // Invalidar queries de tags, links y clusters
      queryClient.invalidateQueries({ queryKey: tagKeys.all })
      queryClient.invalidateQueries({ queryKey: linkKeys.all })
      queryClient.invalidateQueries({ queryKey: tagClustersKeys.all })
      queryClient.invalidateQueries({ queryKey: similarTagsKeys.all })
    },
  })
}
