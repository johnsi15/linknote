import { useMutation, useQueryClient } from '@tanstack/react-query'
import { linkKeys } from '../queries/use-links'

interface CreateLinkData {
  title: string
  url: string
  description?: string
  tags: string[]
}

interface UpdateLinkData extends Partial<CreateLinkData> {
  id: string
}

export function useCreateLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateLinkData) => {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Error creating link')
      return response.json()
    },
    onSuccess: () => {
      // Invalidar todas las queries de links
      queryClient.invalidateQueries({ queryKey: linkKeys.all })
    },
  })
}

export function useUpdateLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateLinkData) => {
      const response = await fetch(`/api/links/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Error updating link')
      return response.json()
    },
    onSuccess: (_, variables) => {
      // Invalidar queries específicas
      queryClient.invalidateQueries({ queryKey: linkKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: linkKeys.lists() })
    },
  })
}

export function useDeleteLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/links/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Error deleting link')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: linkKeys.all })
    },
  })
}
