import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tagKeys } from '../queries/use-tags'
import { linkKeys } from '../queries/use-links'

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
      if (!result.success) return null

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
      const result = await apiUpdateTag(id, name)
      if (!result.success) return null

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
    mutationFn: apiDeleteTag,
    onSuccess: () => {
      // Invalidar queries de tags y links
      queryClient.invalidateQueries({ queryKey: tagKeys.all })
      queryClient.invalidateQueries({ queryKey: linkKeys.all })
    },
  })
}
