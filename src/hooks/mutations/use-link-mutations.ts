import { useMutation, type UseMutationResult, useQueryClient } from '@tanstack/react-query'
import { linkKeys } from '../queries/use-links'
import { tagKeys } from '../queries/use-tags'
import { type LinkFormData } from '@/actions/links'

interface UpdateLinkData extends Partial<LinkFormData> {
  id: string
}

interface ApiResponseSuccess {
  success: true
  linkId: string
}

interface ApiResponseError {
  success: false
  error: string
}

type ApiResponse = ApiResponseSuccess | ApiResponseError

// Helpers para consumir la API route de links
async function apiCreateLink(data: LinkFormData): Promise<ApiResponse> {
  const res = await fetch('/api/links', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  const result: ApiResponse = await res.json()

  console.log({ res, result })

  if (!res.ok || !result.success) {
    const errorMsg = 'error' in result ? result.error : 'Error creating link'
    throw new Error(errorMsg)
  }

  return result
}

// PUT devuelve { data: string } donde data es el linkId actualizado
async function apiUpdateLink(id: string, data: Partial<LinkFormData>): Promise<ApiResponse> {
  const res = await fetch(`/api/links/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  const result: ApiResponse = await res.json()

  if (!res.ok || !result.success) {
    const errorMsg = 'error' in result ? result.error : 'Error updating link'
    throw new Error(errorMsg)
  }

  return result
}

// DELETE devuelve { data: string } donde data es el id borrado
async function apiDeleteLink(id: string): Promise<ApiResponse> {
  const res = await fetch(`/api/links/${id}`, {
    method: 'DELETE',
  })

  const result: ApiResponse = await res.json()

  if (!res.ok || !result.success) {
    const errorMsg = 'error' in result ? result.error : 'Error deleting link'
    throw new Error(errorMsg)
  }

  return result
}

// Save link usa los tipos correctos según la operación
async function apiSaveLink(data: LinkFormData, isUpdate = false, linkId?: string): Promise<ApiResponse> {
  if (isUpdate && linkId) {
    return apiUpdateLink(linkId, data)
  } else {
    return apiCreateLink(data)
  }
}

// Hook para crear un nuevo link
export function useCreateLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: apiCreateLink,
    onSuccess: () => {
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
      return apiUpdateLink(id, linkData)
    },
    onSuccess: (_, variables) => {
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
    mutationFn: apiDeleteLink,
    onSuccess: data => {
      if (data && 'linkId' in data) {
        queryClient.invalidateQueries({ queryKey: linkKeys.detail(data.linkId) })
      }
      queryClient.invalidateQueries({ queryKey: linkKeys.all })
      queryClient.invalidateQueries({ queryKey: tagKeys.all })
    },
  })
}

// Hook para guardar un link (crear o actualizar)
export function useSaveLink(): UseMutationResult<
  ApiResponse,
  Error,
  { data: LinkFormData; isUpdate?: boolean; linkId?: string }
> {
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
      return apiSaveLink(data, isUpdate, linkId)
    },
    onSuccess: (_, variables) => {
      if (variables.isUpdate && variables.linkId) {
        queryClient.invalidateQueries({ queryKey: linkKeys.detail(variables.linkId) })
      }
      queryClient.invalidateQueries({ queryKey: linkKeys.lists() })
      queryClient.invalidateQueries({ queryKey: tagKeys.all })
    },
  })
}
