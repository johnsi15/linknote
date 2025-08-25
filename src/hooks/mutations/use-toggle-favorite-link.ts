import { useMutation, useQueryClient } from '@tanstack/react-query'
import { linkKeys } from '@/hooks/queries/use-links'

type ToggleFavoriteResponse = {
  success: boolean
  linkId: string
  isFavorite: boolean
}

export function useToggleFavoriteLink() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (linkId: string): Promise<ToggleFavoriteResponse> => {
      const res = await fetch(`/api/links/${linkId}/favorite`, {
        method: 'PATCH',
      })

      if (!res.ok) throw new Error('No cant toggle favorite status')

      return res.json()
    },
    onSuccess: (data, linkId) => {
      // Invalidar queries relevantes para refrescar la UI
      queryClient.invalidateQueries({ queryKey: linkKeys.lists() })
      queryClient.invalidateQueries({ queryKey: linkKeys.detail(linkId) })
    },
  })
}
